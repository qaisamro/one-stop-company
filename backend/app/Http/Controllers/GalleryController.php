<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery; // تأكد من إنشاء نموذج Gallery.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GalleryController extends Controller
{
    /**
     * Display a listing of the images.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch all images from the database
        $images = Gallery::orderBy('created_at', 'desc')->get();
        return response()->json(['images' => $images]);
    }

    /**
     * Store a newly created image in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:50000', // Max size is 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            // Store the image in the 'public/gallery' directory
            $path = $request->file('image')->store('public/gallery');

            // Generate the URL for the stored image
            $url = Storage::url($path);

            // Create a new Gallery entry in the database
            $image = Gallery::create([
                'path' => $url,
            ]);

            return response()->json(['message' => 'Image uploaded successfully.', 'image' => $image], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload image. ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified image from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $image = Gallery::findOrFail($id);

            // Delete the image file from storage
            $path = str_replace('/storage', 'public', $image->path);
            Storage::delete($path);

            // Delete the image record from the database
            $image->delete();

            return response()->json(['message' => 'Image deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete image.'], 500);
        }
    }
}
