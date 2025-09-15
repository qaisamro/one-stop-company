<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar');
        Log::info("Fetching projects for language: {$lang}");

        try {
            $projects = Project::getAllProjects($lang)->map(function ($project) {
                $project->image = $project->image ? url(Storage::url($project->image)) : null;
                $project->additional_images = array_map(function ($img) {
                    return url(Storage::url($img));
                }, $project->additional_images ?? []);
                return $project;
            });
            return response()->json($projects);
        } catch (\Exception $e) {
            Log::error('Error in getProjects:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم', 'details' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id)
    {
        Log::info("Requesting project with ID: {$id}");

        try {
            $project = Project::getProjectById($id);
            if (!$project) {
                return response()->json(['error' => 'المشروع غير موجود'], 404);
            }

            $project->image = $project->image ? url(Storage::url($project->image)) : null;
            $project->additional_images = array_map(function ($img) {
                return url(Storage::url($img));
            }, $project->additional_images ?? []);

            return response()->json($project);
        } catch (\Exception $e) {
            Log::error('Error in getProjectById:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ في جلب تفاصيل المشروع', 'details' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'language' => 'required|string|in:ar,en',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'additional_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'sections' => 'nullable|json',
        ]);

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/projects', 'public');
            }

            $additionalImagePaths = [];
            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $file) {
                    $path = $file->store('uploads/projects', 'public');
                    $additionalImagePaths[] = $path;
                }
            }

            $sectionsData = [];
            if ($request->has('sections')) {
                $sectionsData = json_decode($request->input('sections'), true);
                if (!is_array($sectionsData)) {
                    return response()->json(['error' => 'الأقسام يجب أن تكون مصفوفة', 'details' => 'Invalid sections format'], 400);
                }
            }

            $projectData = [
                'title' => $request->title,
                'description' => $request->description,
                'image' => $imagePath,
                'url' => $request->url,
                'language' => $request->language,
                'detailed_description' => $request->detailed_description,
                'additional_images' => $additionalImagePaths,
                'extra_title' => $request->extra_title,
                'title_description' => $request->title_description,
                'sections' => $sectionsData,
            ];

            $project = Project::create($projectData);
            $project->image = $project->image ? url(Storage::url($project->image)) : null;
            $project->additional_images = array_map(function ($img) {
                return url(Storage::url($img));
            }, $project->additional_images ?? []);
            return response()->json(['message' => 'تمت إضافة المشروع بنجاح', 'id' => $project->id, 'project' => $project], 201);
        } catch (\Exception $e) {
            Log::error('Error in createProject:', ['error' => $e->getMessage(), 'data' => $projectData, 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة المشروع', 'details' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'language' => 'required|string|in:ar,en',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'additional_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'existing_additional_images' => 'nullable|json',
            'sections' => 'nullable|json',
        ]);

        try {
            $project = Project::getProjectById($id);
            if (!$project) {
                return response()->json(['error' => 'المشروع غير موجود'], 404);
            }

            $imagePath = $project->image;
            if ($request->hasFile('image')) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = $request->file('image')->store('uploads/projects', 'public');
            }

            $additionalImagePaths = [];
            if ($request->has('existing_additional_images')) {
                $existingImageUrlsFromRequest = json_decode($request->input('existing_additional_images'), true);
                if (!is_array($existingImageUrlsFromRequest)) {
                    return response()->json(['error' => 'الصور الإضافية الحالية يجب أن تكون مصفوفة', 'details' => 'Invalid existing_additional_images format'], 400);
                }
                // Convert URLs back to relative paths for storage
                $additionalImagePaths = array_map(function ($url) {
                    return str_replace(url(Storage::url('')), '', $url);
                }, $existingImageUrlsFromRequest);
                // Delete images that are no longer in the existing list
                $currentImages = $project->additional_images ?? [];
                foreach ($currentImages as $oldImg) {
                    if (!in_array(url(Storage::url($oldImg)), $existingImageUrlsFromRequest) && Storage::disk('public')->exists($oldImg)) {
                        Storage::disk('public')->delete($oldImg);
                    }
                }
            }

            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $file) {
                    $path = $file->store('uploads/projects', 'public');
                    $additionalImagePaths[] = $path;
                }
            }

            $sectionsData = $project->sections ?? [];
            if ($request->has('sections')) {
                $sectionsData = json_decode($request->input('sections'), true);
                if (!is_array($sectionsData)) {
                    return response()->json(['error' => 'الأقسام يجب أن تكون مصفوفة', 'details' => 'Invalid sections format'], 400);
                }
            }

            $projectData = [
                'title' => $request->title,
                'description' => $request->description,
                'image' => $imagePath,
                'url' => $request->url,
                'language' => $request->language,
                'detailed_description' => $request->detailed_description,
                'additional_images' => $additionalImagePaths,
                'extra_title' => $request->extra_title,
                'title_description' => $request->title_description,
                'sections' => $sectionsData,
            ];

            Log::info('Updating project:', ['id' => $id, 'data' => $projectData]);

            $project->update($projectData);
            $project->image = $project->image ? url(Storage::url($project->image)) : null;
            $project->additional_images = array_map(function ($img) {
                return url(Storage::url($img));
            }, $project->additional_images ?? []);

            return response()->json(['message' => 'تم تحديث المشروع بنجاح', 'project' => $project]);
        } catch (\Exception $e) {
            Log::error('Error in updateProject:', ['error' => $e->getMessage(), 'data' => $projectData, 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث المشروع', 'details' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $project = Project::getProjectById($id);
            if (!$project) {
                return response()->json(['error' => 'المشروع غير موجود'], 404);
            }

            if ($project->image && Storage::disk('public')->exists($project->image)) {
                Storage::disk('public')->delete($project->image);
            }

            if (is_array($project->additional_images)) {
                foreach ($project->additional_images as $img) {
                    if (Storage::disk('public')->exists($img)) {
                        Storage::disk('public')->delete($img);
                    }
                }
            }

            $project->delete();
            return response()->json(['message' => 'تم حذف المشروع بنجاح']);
        } catch (\Exception $e) {
            Log::error('Error in deleteProject:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف المشروع', 'details' => $e->getMessage()], 500);
        }
    }

    public function getProjectBackground()
    {
        Log::info('Fetching project background');
        try {
            $imagePath = DB::table('settings')->where('key_name', 'projects_background_image')->value('value');
            return response()->json(['imagePath' => $imagePath ? url(Storage::url($imagePath)) : '']);
        } catch (\Exception $e) {
            Log::error('Error in getProjectBackground:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ في جلب صورة الخلفية', 'details' => $e->getMessage()], 500);
        }
    }

    public function updateProjectBackground(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            $oldImagePath = DB::table('settings')->where('key_name', 'projects_background_image')->value('value');
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }

            $newImagePath = $request->file('image')->store('uploads/projects', 'public');
            DB::table('settings')->updateOrInsert(
                ['key_name' => 'projects_background_image'],
                ['value' => $newImagePath, 'updated_at' => now()]
            );

            return response()->json(['message' => 'تم تحديث صورة الخلفية بنجاح', 'imagePath' => url(Storage::url($newImagePath))]);
        } catch (\Exception $e) {
            Log::error('Error in updateProjectBackground:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث صورة الخلفية', 'details' => $e->getMessage()], 500);
        }
    }
}