<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BlogController extends Controller
{
    /**
     * Display a listing of the blogs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar');
        $blogs = Blog::select(
            'id',
            "title_{$lang} as title",
            "description_{$lang} as description",
            "content_{$lang} as content",
            'image',
            'additional_images',
            'date',
            'language',
            'author',
            'category',
            'created_at',
            'updated_at'
        )
        ->where('language', $lang)
        ->orderBy('id', 'desc')
        ->get();

        $blogs->transform(function ($blog) {
            $blog->image = $blog->image ? Storage::url($blog->image) : null;
            $blog->additional_images = collect($blog->additional_images ?? [])->map(function ($img) {
                return Storage::url($img);
            })->toArray();
            
            return $blog;
        });

        return response()->json($blogs);
    }

    /**
     * Display the specified blog.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        $lang = $request->query('lang', 'ar');
        $blog = Blog::select(
            'id',
            "title_{$lang} as title",
            "description_{$lang} as description",
            "content_{$lang} as content",
            'image',
            'additional_images',
            'date',
            'language',
            'author',
            'category',
            'created_at',
            'updated_at'
        )
        ->where('id', $id)
        ->where('language', $lang)
        ->first();

        if (!$blog) {
            return response()->json(['error' => 'Blog not found'], 404);
        }

        $blog->image = $blog->image ? Storage::url($blog->image) : null;
        $blog->additional_images = collect($blog->additional_images ?? [])->map(function ($img) {
            return Storage::url($img);
        })->toArray();

        return response()->json($blog);
    }

    /**
     * Store a newly created blog in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'date' => 'required|date',
            'language' => 'required|string|in:ar,en',
            'author' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'additionalImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'existingAdditionalImages' => 'nullable|string',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('uploads/blogs', 'public');
        }

        $additionalImagesPaths = [];
        if ($request->hasFile('additionalImages')) {
            foreach ($request->file('additionalImages') as $file) {
                $additionalImagesPaths[] = $file->store('uploads/blogs', 'public');
            }
        }

        $existingAdditionalImages = [];
        if ($request->filled('existingAdditionalImages')) {
            try {
                $existingImages = json_decode($request->input('existingAdditionalImages'), true);
                $existingAdditionalImages = collect($existingImages)->map(function ($imgUrl) {
                    return 'uploads/blogs/' . basename($imgUrl);
                })->toArray();
            } catch (\Exception $e) {
                Log::error('Error parsing existingAdditionalImages for create:', ['error' => $e->getMessage()]);
            }
        }

        $allAdditionalImages = array_merge($existingAdditionalImages, $additionalImagesPaths);

        try {
            $blog = Blog::create([
                "title_{$request->language}" => $request->title,
                "description_{$request->language}" => $request->description,
                "content_{$request->language}" => $request->content,
                'image' => $imagePath,
                'additional_images' => $allAdditionalImages,
                'date' => $request->date,
                'language' => $request->language,
                'author' => $request->author,
                'category' => $request->category,
            ]);

            $responseBlog = $blog->toArray();
            $responseBlog['image'] = $blog->image ? Storage::url($blog->image) : null;
            $responseBlog['additional_images'] = collect($blog->additional_images)->map(function ($img) {
                return Storage::url($img);
            })->toArray();

            return response()->json(['message' => 'Blog created successfully', 'blog' => $responseBlog], 201);
        } catch (\Exception $e) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            foreach ($additionalImagesPaths as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
            Log::error('Error creating blog:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to create blog', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified blog in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
   public function update(Request $request, $id)
    {
        // تسجيل البيانات الواردة للتحقق
        Log::info('Update blog request:', [
            'id' => $id,
            'data' => $request->all(),
            'files' => $request->file(),
            'method' => $request->method(),
            '_method' => $request->input('_method'),
        ]);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'date' => 'required|date',
            'language' => 'required|string|in:ar,en',
            'author' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'delete_image' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'additionalImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'existingAdditionalImages' => 'nullable|string',
        ]);

        $blog = Blog::where('id', $id)->where('language', $request->language)->first();

        if (!$blog) {
            return response()->json(['error' => 'Blog not found'], 404);
        }

        $oldImagePath = $blog->image;
        $oldAdditionalImages = $blog->additional_images ?? [];

        $newImagePath = $oldImagePath;
        if ($request->input('delete_image', false)) {
            $newImagePath = null;
        } elseif ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('uploads/blogs', 'public');
        }

        $newAdditionalImages = [];
        if ($request->hasFile('additionalImages')) {
            foreach ($request->file('additionalImages') as $file) {
                $newAdditionalImages[] = $file->store('uploads/blogs', 'public');
            }
        }

        $existingAdditionalImages = [];
        if ($request->filled('existingAdditionalImages')) {
            try {
                $existingImages = json_decode($request->input('existingAdditionalImages'), true);
                $existingAdditionalImages = collect($existingImages)->map(function ($imgUrl) {
                    return 'uploads/blogs/' . basename($imgUrl);
                })->toArray();
            } catch (\Exception $e) {
                Log::error('Error parsing existingAdditionalImages for update:', ['error' => $e->getMessage()]);
            }
        }

        $allAdditionalImages = array_merge($existingAdditionalImages, $newAdditionalImages);

        try {
            $blog->update([
                "title_{$request->language}" => $request->title,
                "description_{$request->language}" => $request->description,
                "content_{$request->language}" => $request->content,
                'image' => $newImagePath,
                'additional_images' => $allAdditionalImages,
                'date' => $request->date,
                'author' => $request->author,
                'category' => $request->category,
                'language' => $request->language,
            ]);

            if ($oldImagePath && $newImagePath !== $oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }

            foreach ($oldAdditionalImages as $oldImg) {
                if (!in_array($oldImg, $allAdditionalImages) && Storage::disk('public')->exists($oldImg)) {
                    Storage::disk('public')->delete($oldImg);
                }
            }

            $updatedBlog = $blog->fresh()->toArray();
            $updatedBlog['image'] = $updatedBlog['image'] ? Storage::url($updatedBlog['image']) : null;
            $updatedBlog['additional_images'] = collect($updatedBlog['additional_images'])->map(function ($img) {
                return Storage::url($img);
            })->toArray();

            return response()->json(['message' => 'Blog updated successfully', 'blog' => $updatedBlog]);
        } catch (\Exception $e) {
            if ($newImagePath && $newImagePath !== $oldImagePath && Storage::disk('public')->exists($newImagePath)) {
                Storage::disk('public')->delete($newImagePath);
            }
            foreach ($newAdditionalImages as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
            Log::error('Error updating blog:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to update blog', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified blog from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['error' => 'Blog not found'], 404);
        }

        $imagePath = $blog->image;
        $additionalImages = $blog->additional_images ?? [];

        try {
            $blog->delete();

            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            foreach ($additionalImages as $imgPath) {
                if (Storage::disk('public')->exists($imgPath)) {
                    Storage::disk('public')->delete($imgPath);
                }
            }

            return response()->json(['message' => 'Blog deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting blog:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to delete blog', 'details' => $e->getMessage()], 500);
        }
    }
}