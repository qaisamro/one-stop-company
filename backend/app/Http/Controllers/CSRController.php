<?php

namespace App\Http\Controllers;

use App\Models\CSR;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\FixedParagraph;

class CSRController extends Controller
{
    /**
     * Get all CSR items.
     * Returns an array of CSR objects.
     */
    public function index()
    {
        try {
            $csrItems = CSR::orderBy('created_at', 'desc')->get(); // Get all items, ordered by creation date

            if ($csrItems->isEmpty()) {
                return response()->json([]); // Return empty array if no items
            }

            // Map to format output, including image URLs
            $formattedItems = $csrItems->map(function ($csr) {
                return $this->formatCsrItem($csr);
            });

            return response()->json($formattedItems);

        } catch (\Exception $e) {
            Log::error('Error in index CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a single CSR item by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $csr = CSR::findOrFail($id);
            return response()->json($this->formatCsrItem($csr));
        } catch (\Exception $e) {
            Log::error('Error in show CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new CSR item.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation rules for creating a new item
        $validator = $this->getValidationRules($request, 'create');

        if ($validator->fails()) {
            return response()->json(['error' => 'خطأ في التحقق من البيانات', 'details' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $csr = new CSR();
            $this->saveCsrData($request, $csr); // Use a common method to save data

            DB::commit();

            // Return the newly created item with formatted URLs
            return response()->json(['message' => 'تم إنشاء المحتوى بنجاح! ✅', 'data' => $this->formatCsrItem($csr)], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in store CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            // Attempt to clean up uploaded files on failure
            $this->cleanupFailedUploads($request, $csr ?? null);
            return response()->json(['error' => 'فشل إنشاء المحتوى', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing CSR item.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Validation rules for updating an item
        $validator = $this->getValidationRules($request, 'update', $id);

        if ($validator->fails()) {
            return response()->json(['error' => 'خطأ في التحقق من البيانات', 'details' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $csr = CSR::findOrFail($id);
            $this->saveCsrData($request, $csr); // Use the common method to save data

            DB::commit();

            // Return the updated item with formatted URLs
            return response()->json(['message' => 'تم تحديث المحتوى بنجاح! ✅', 'data' => $this->formatCsrItem($csr)], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in update CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            // Attempt to clean up uploaded files on failure
            $this->cleanupFailedUploads($request, $csr ?? null);
            return response()->json(['error' => 'فشل تحديث المحتوى', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a CSR item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            $csr = CSR::findOrFail($id);

            // Delete associated images
            if ($csr->image && Storage::disk('public')->exists($csr->image)) {
                Storage::disk('public')->delete($csr->image);
            }
            if (is_array($csr->additional_images)) {
                foreach ($csr->additional_images as $path) {
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $csr->delete(); // Delete the record
            DB::commit();

            return response()->json(['message' => 'تم حذف المحتوى بنجاح! ✅']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in destroy CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل في حذف المحتوى.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a specific image (main or additional) from a CSR item.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $csrId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteImage(Request $request, $csrId)
    {
        // Validation for image deletion request
        $validator = Validator::make($request->all(), [
            'image_path' => 'required|string',
            'type' => 'required|in:main,additional',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'خطأ في التحقق من البيانات', 'details' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            $csr = CSR::findOrFail($csrId);
            $imagePathFromRequest = $request->input('image_path');
            $type = $request->input('type');

            // Convert full URL to relative path for comparison and deletion
            $relativePath = $this->getRelativeImagePath($imagePathFromRequest);

            if (!$relativePath || !str_starts_with($relativePath, 'uploads/csr/')) {
                Log::error('Invalid image path provided for deletion.', ['path' => $imagePathFromRequest, 'extracted_path' => $relativePath]);
                return response()->json(['error' => 'مسار الصورة غير صالح.'], 400);
            }

            $deleted = false;
            if ($type === 'main') {
                if ($csr->image === $relativePath) {
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                    $csr->image = null; // Set image to null
                    $deleted = true;
                }
            } elseif ($type === 'additional') {
                $additionalImages = $csr->additional_images ?? [];
                $key = array_search($relativePath, $additionalImages);

                if ($key !== false) { // Image found in the array
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                    unset($additionalImages[$key]);
                    $csr->additional_images = array_values($additionalImages); // Re-index array
                    $deleted = true;
                }
            }

            if ($deleted) {
                $csr->save();
                DB::commit();
                return response()->json(['message' => 'تم حذف الصورة بنجاح! ✅']);
            } else {
                // Image not found in the record
                DB::rollBack(); // Rollback if no action taken
                return response()->json(['error' => "الصورة المطلوبة ({$type}) غير موجودة أو لا تتطابق مع السجل."], 404);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in deleteImage CSR:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل في حذف الصورة.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to format a single CSR item for API response.
     * Includes generating full URLs for images.
     */
    private function formatCsrItem(CSR $csr)
    {
        $mainImage = $csr->image ? Storage::url($csr->image) : null;

        $additionalImages = is_array($csr->additional_images) ? $csr->additional_images : [];
        $mappedAdditionalImages = collect($additionalImages)->map(function ($path) {
            if (Storage::disk('public')->exists($path)) {
                return Storage::url($path);
            }
            Log::warning('Additional image not found in storage during formatting:', ['path' => $path]);
            return null;
        })->filter()->values()->toArray();

        return [
            'id' => $csr->id,
            'title_ar' => $csr->title_ar,
            'title_en' => $csr->title_en,
            'paragraph_ar' => $csr->paragraph_ar,
            'paragraph_en' => $csr->paragraph_en,
            'description_ar' => $csr->description_ar,
            'description_en' => $csr->description_en,
            'content_ar' => $csr->content_ar,
            'content_en' => $csr->content_en,
            'date' => $csr->date,
            'author_ar' => $csr->author_ar,
            'author_en' => $csr->author_en,
            'category_ar' => $csr->category_ar,
            'category_en' => $csr->category_en,
            'image' => $mainImage,
            'additional_images' => $mappedAdditionalImages,
        ];
    }

    /**
     * Helper method to get validation rules, adaptable for create/update.
     */
    private function getValidationRules(Request $request, string $scenario, ?int $id = null)
    {
        $rules = [
            'title_ar' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'paragraph_ar' => 'nullable|string',
            'paragraph_en' => 'nullable|string',
            'description_ar' => 'required|string',
            'description_en' => 'required|string',
            'content_ar' => 'nullable|string',
            'content_en' => 'nullable|string',
            'date' => 'nullable|date',
            'author_ar' => 'nullable|string|max:255',
            'author_en' => 'nullable|string|max:255',
            'category_ar' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:50000', // Max 50MB
            'additional_images' => 'nullable|array',
            'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:50000', // Max 50MB per additional image
            'existing_additional_images' => 'nullable|array', // URLs of existing images to keep
            'existing_additional_images.*' => 'nullable|string',
        ];

        // Adjust validation for 'create' or 'update' if needed.
        // For example, if the main image is mandatory on creation:
        if ($scenario === 'create') {
            // $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif,svg|max:50000';
        }

        // If updating and no new image is being uploaded, ensure 'image' is not required.
        if ($scenario === 'update' && !$request->hasFile('image')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:50000';
        }

        return Validator::make($request->all(), $rules);
    }

    /**
     * Helper method to save or update CSR data, handling image uploads.
     * This method now incorporates the image logic from your first code snippet.
     */
    private function saveCsrData(Request $request, CSR $csr)
    {
        $currentMainImage = $csr->image; // Current path if exists
        $oldAdditionalImages = $csr->additional_images ?? [];
        $newlyUploadedAdditionalImagePaths = [];
        $finalAdditionalImagePaths = [];

        // --- Handle Main Image ---
        if ($request->hasFile('image')) {
            // Delete old main image if it exists and is different
            if ($currentMainImage && Storage::disk('public')->exists($currentMainImage)) {
                Storage::disk('public')->delete($currentMainImage);
            }
            // Store the new image
            $newMainImagePath = $request->file('image')->store('uploads/csr', 'public');
            $csr->image = $newMainImagePath; // Update the model's image property
        }
        // If the main image field is present but empty, it implies removal.
        // This scenario needs careful handling if it's possible via the form.
        // For now, we only handle new uploads.

        // --- Handle Additional Images ---
        // 1. Upload newly selected additional images
        if ($request->hasFile('additional_images')) {
            foreach ($request->file('additional_images') as $file) {
                $path = $file->store('uploads/csr', 'public');
                $newlyUploadedAdditionalImagePaths[] = $path;
            }
        }

        // 2. Collect existing additional images that the user wants to keep
        $keptExistingAdditionalImages = [];
        if ($request->filled('existing_additional_images')) {
            $keptExistingAdditionalImages = collect($request->input('existing_additional_images'))->map(function ($imgUrl) {
                // Convert full URL to relative path using the helper
                return $this->getRelativeImagePath($imgUrl);
            })->filter(function ($path) {
                // Ensure the path is valid and exists before keeping it
                return $path && Storage::disk('public')->exists($path);
            })->values()->toArray();
        }

        // Combine kept existing images with newly uploaded ones
        $finalAdditionalImagePaths = array_merge($keptExistingAdditionalImages, $newlyUploadedAdditionalImagePaths);

        // 3. Delete old additional images that are NOT in the final list
        foreach ($oldAdditionalImages as $oldImgPath) {
            if (!in_array($oldImgPath, $finalAdditionalImagePaths) && Storage::disk('public')->exists($oldImgPath)) {
                Storage::disk('public')->delete($oldImgPath);
                Log::info('Old additional image deleted during save:', ['path' => $oldImgPath]);
            }
        }

        // --- Fill and Save Model ---
        $csr->fill($request->only([
            'title_ar', 'title_en', 'paragraph_ar', 'paragraph_en',
            'description_ar', 'description_en', 'content_ar', 'content_en',
            'date', 'author_ar', 'author_en', 'category_ar', 'category_en'
        ]));
        // Assign the final list of additional images to the model
        $csr->additional_images = $finalAdditionalImagePaths;

        $csr->save();

        // Refresh the model to ensure all changes are loaded, especially after saving.
        $csr->refresh();
    }

    /**
     * Helper to extract relative path from various URL formats.
     * This version attempts to be more robust in converting URLs to storage paths.
     */
    private function getRelativeImagePath(string $url): ?string
    {
        // If the URL is already a relative path that starts correctly, return it.
        if (str_starts_with($url, 'uploads/csr/')) {
            return $url;
        }

        $baseUrl = config('app.url'); // e.g., http://localhost:8000 or https://yourdomain.com

        // Try to remove the base URL from the beginning of the string
        if (str_starts_with($url, $baseUrl)) {
            $path = substr($url, strlen($baseUrl));
        } else {
            // If the base URL is not at the start, assume it might be a relative path already
            // or an external URL we don't want to process.
            $path = $url;
        }

        // Remove leading slashes that might result from concatenation
        $path = ltrim($path, '/');

        // Handle '/storage/' prefix if it exists (common for Laravel public disk access)
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        // Ensure the path starts with the expected directory
        if (!str_starts_with($path, 'uploads/csr/')) {
            Log::warning('Image path does not start with "uploads/csr/":', ['original_url' => $url, 'processed_path' => $path]);
            return null; // Path is invalid or not within our expected storage structure
        }

        return $path;
    }

    /**
     * Helper to clean up uploaded files in case of an error during save/update.
     */
    private function cleanupFailedUploads(Request $request, ?CSR $csr = null)
    {
        // If the main image was uploaded and the save failed, try to delete it.
        // We need to find the path where it *would* have been stored.
        if ($request->hasFile('image')) {
            $tempPath = $request->file('image')->store('uploads/csr', 'public');
            if (Storage::disk('public')->exists($tempPath)) {
                Storage::disk('public')->delete($tempPath);
                Log::info('Cleaned up failed main image upload.', ['path' => $tempPath]);
            }
        }

        // Cleanup additional images if uploaded but save failed
        if ($request->hasFile('additional_images')) {
            foreach ($request->file('additional_images') as $file) {
                $tempPath = $file->store('uploads/csr', 'public');
                if (Storage::disk('public')->exists($tempPath)) {
                    Storage::disk('public')->delete($tempPath);
                    Log::info('Cleaned up failed additional image upload.', ['path' => $tempPath]);
                }
            }
        }
    }


    // في CSRController.php
public function getFixedParagraph()
{
    try {
        // الحصول على الفقرة الثابتة من قاعدة البيانات
        $fixedParagraph = FixedParagraph::first();

        if (!$fixedParagraph) {
            // إذا لم توجد فقرة ثابتة، إنشاء واحدة افتراضية
            $fixedParagraph = FixedParagraph::create([
                'paragraph_ar' => 'هذه فقرة ثابتة للمسؤولية المجتمعية باللغة العربية',
                'paragraph_en' => 'This is a fixed paragraph for CSR in English'
            ]);
        }

        return response()->json([
            'paragraph_ar' => $fixedParagraph->paragraph_ar,
            'paragraph_en' => $fixedParagraph->paragraph_en
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching fixed paragraph:', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to fetch fixed paragraph'], 500);
    }
}

public function saveFixedParagraph(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'paragraph_ar' => 'required|string',
            'paragraph_en' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'details' => $validator->errors()], 422);
        }

        // الحصول على الفقرة الثابتة أو إنشاء جديدة إذا لم توجد
        $fixedParagraph = FixedParagraph::first();

        if ($fixedParagraph) {
            // تحديث الفقرة الموجودة
            $fixedParagraph->update([
                'paragraph_ar' => $request->paragraph_ar,
                'paragraph_en' => $request->paragraph_en
            ]);
        } else {
            // إنشاء فقرة جديدة
            $fixedParagraph = FixedParagraph::create([
                'paragraph_ar' => $request->paragraph_ar,
                'paragraph_en' => $request->paragraph_en
            ]);
        }

        return response()->json([
            'message' => 'Fixed paragraph saved successfully',
            'data' => [
                'paragraph_ar' => $fixedParagraph->paragraph_ar,
                'paragraph_en' => $fixedParagraph->paragraph_en
            ]
        ]);
    } catch (\Exception $e) {
        Log::error('Error saving fixed paragraph:', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to save fixed paragraph'], 500);
    }

}
}
