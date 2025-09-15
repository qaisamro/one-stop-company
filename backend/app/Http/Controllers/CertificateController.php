<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CertificateController extends Controller
{
    /**
     * Display a listing of the certificates.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar');

        $certificates = Certificate::select([
            'id',
            'title',
            'image',
            'issuer',
            'year',
            'link',
            'language',
            'created_at',
            'updated_at',
        ])
        ->where('language', $lang)
        ->orderBy('id', 'desc')
        ->get()
        ->append('photo_url');

        return response()->json($certificates);
    }

    /**
     * Store a newly created certificate in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'link' => 'nullable|url',
            'language' => 'required|string|in:ar,en',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'title.required' => 'حقل العنوان مطلوب.',
            'issuer.required' => 'حقل الجهة المانحة مطلوب.',
            'year.integer' => 'يجب أن تكون السنة عددًا صحيحًا.',
            'year.min' => 'يجب أن تكون السنة بعد 1900.',
            'year.max' => 'يجب أن تكون السنة حتى السنة الحالية.',
            'link.url' => 'يجب أن يكون الرابط صالحًا.',
            'language.required' => 'حقل اللغة مطلوب.',
            'language.in' => 'اللغة يجب أن تكون إما ar أو en.',
            'image.required' => 'حقل الصورة مطلوب.',
            'image.image' => 'يجب أن يكون الملف صورة.',
            'image.mimes' => 'يجب أن تكون الصورة بصيغة jpeg, png, jpg, أو gif.',
            'image.max' => 'يجب ألا يتجاوز حجم الصورة 2 ميجابايت.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('uploads/certificates', 'public');
        }

        try {
            $certificate = Certificate::create([
                'title' => $request->title,
                'image' => $imagePath,
                'issuer' => $request->issuer,
                'year' => $request->year,
                'link' => $request->link,
                'language' => $request->language,
            ]);

            $responseCert = $certificate->toArray();
            $responseCert['photo_url'] = $certificate->photo_url;

            return response()->json(['message' => 'تمت الإضافة بنجاح', 'certificate' => $responseCert], 201);
        } catch (\Exception $e) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            Log::error('Error creating certificate:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة الشهادة', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified certificate in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'link' => 'nullable|url',
            'language' => 'required|string|in:ar,en',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'title.required' => 'حقل العنوان مطلوب.',
            'issuer.required' => 'حقل الجهة المانحة مطلوب.',
            'year.integer' => 'يجب أن تكون السنة عددًا صحيحًا.',
            'year.min' => 'يجب أن تكون السنة بعد 1900.',
            'year.max' => 'يجب أن تكون السنة حتى السنة الحالية.',
            'link.url' => 'يجب أن يكون الرابط صالحًا.',
            'language.required' => 'حقل اللغة مطلوب.',
            'language.in' => 'اللغة يجب أن تكون إما ar أو en.',
            'image.image' => 'يجب أن يكون الملف صورة.',
            'image.mimes' => 'يجب أن تكون الصورة بصيغة jpeg, png, jpg, أو gif.',
            'image.max' => 'يجب ألا يتجاوز حجم الصورة 2 ميجابايت.',
        ]);

        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['error' => 'الشهادة غير موجودة.'], 404);
        }

        $oldImagePath = $certificate->image;
        $newUploadedImagePath = null;
        if ($request->hasFile('image')) {
            $newUploadedImagePath = $request->file('image')->store('uploads/certificates', 'public');
        }

        $finalImagePathForDb = $oldImagePath;
        if ($newUploadedImagePath) {
            $finalImagePathForDb = $newUploadedImagePath;
        }

        try {
            $certificate->update([
                'title' => $request->title,
                'image' => $finalImagePathForDb,
                'issuer' => $request->issuer,
                'year' => $request->year,
                'link' => $request->link,
                'language' => $request->language,
            ]);

            if ($oldImagePath && $finalImagePathForDb !== $oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }

            $updatedCertificateData = $certificate->fresh()->toArray();
            $updatedCertificateData['photo_url'] = $certificate->photo_url;

            return response()->json(['message' => 'تم التحديث بنجاح', 'certificate' => $updatedCertificateData]);
        } catch (\Exception $e) {
            if ($newUploadedImagePath && Storage::disk('public')->exists($newUploadedImagePath)) {
                Storage::disk('public')->delete($newUploadedImagePath);
            }
            Log::error('Error updating certificate:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'image_provided' => $request->hasFile('image') ? 'Yes' : 'No'
            ]);
            return response()->json(['error' => 'فشل تحديث الشهادة', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified certificate from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['error' => 'الشهادة غير موجودة.'], 404);
        }

        $imagePath = $certificate->image;

        try {
            $certificate->delete();

            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json(['message' => 'تم الحذف بنجاح']);
        } catch (\Exception $e) {
            Log::error('Error deleting certificate:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف الشهادة', 'details' => $e->getMessage()], 500);
        }
    }
}