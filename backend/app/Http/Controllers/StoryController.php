<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class StoryController extends Controller
{
    /**
     * Display the story content based on language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $lang = $request->query('lang', 'en'); // Default to 'en'

        try {
            $story = Story::where('language', $lang)->first();

            // Prepare default data if story not found
            $storyData = [
                'id' => $story ? $story->id : null,
                'title' => $story ? $story->title : '',
                'content' => $story ? $story->content : '',
                // ***** هذا هو الجزء الأساسي: تحويل المسار إلى URL كامل *****
                'image_url' => $story && $story->image_url ? asset(Storage::url($story->image_url)) : null,
                'language' => $lang,
                'created_at' => $story ? $story->created_at : null,
                'updated_at' => $story ? $story->updated_at : null,
            ];

            return response()->json($storyData);
        } catch (\Exception $e) {
            Log::error('Error in getStory:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to fetch story', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created story in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'required|in:ar,en|unique:story,language', // Ensure language is unique
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB limit
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                // تخزين الملف في 'public/uploads/story' وسيعيد المسار النسبي
                $imagePath = $request->file('image')->store('uploads/story', 'public');
            }

            $story = Story::create([
                'language' => $request->language,
                'title' => $request->title,
                'content' => $request->content,
                'image_url' => $imagePath,
            ]);

            return response()->json([
                'message' => '✅ Story created successfully',
                // ***** هنا أيضًا: إرجاع URL كامل بعد الرفع *****
                'image_url' => $story->image_url ? asset(Storage::url($story->image_url)) : null,
                'title' => $story->title,
                'content' => $story->content,
                'language' => $story->language
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in createStory:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to create story', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified story in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'required|in:ar,en',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB limit
            'delete_image' => 'nullable|boolean', // إضافة هذا الخيار للسماح بحذف الصورة بدون رفع بديل
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $story = Story::find($id);

            if (!$story) {
                return response()->json(['error' => 'Story not found'], 404);
            }

            $imagePath = $story->image_url; // Keep existing image by default

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if it exists
                if ($story->image_url) {
                    Storage::disk('public')->delete($story->image_url);
                }
                // Store new image
                $imagePath = $request->file('image')->store('uploads/story', 'public');
            } elseif ($request->has('delete_image') && $request->input('delete_image')) {
                // If client explicitly sent delete_image as true, delete old image
                if ($story->image_url) {
                    Storage::disk('public')->delete($story->image_url);
                }
                $imagePath = null;
            }

            $story->update([
                'title' => $request->title,
                'content' => $request->content,
                'image_url' => $imagePath,
                'language' => $request->language, // Allow updating language too, if desired
            ]);

            return response()->json([
                'message' => '✅ Story updated successfully',
                // ***** وهنا أيضًا: إرجاع URL كامل بعد التحديث *****
                'image_url' => $story->image_url ? asset(Storage::url($story->image_url)) : null,
                'title' => $story->title,
                'content' => $story->content,
                'language' => $story->language
            ]);
        } catch (\Exception $e) {
            Log::error('Error in updateStory:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to update story', 'details' => $e->getMessage()], 500);
        }
    }
}