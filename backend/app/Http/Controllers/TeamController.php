<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamSocial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{
    /**
     * Display a listing of the team members.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar');

        try {
            $members = Team::with('socials')->where('language', $lang)->get();
            return response()->json($members->map(function ($member) {
                return $member->append('photo_url'); // Include photo_url in response
            }));
        } catch (\Exception $e) {
            Log::error('Error in TeamController@index:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created team member in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'language' => 'required|in:ar,en',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            'socials' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        DB::beginTransaction();
        try {
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('uploads/team', 'public');
            }

            $member = Team::create([
                'name' => $request->name,
                'position' => $request->position,
                'photo' => $photoPath,
                'language' => $request->language,
            ]);

            $socials = json_decode($request->socials, true);
            if (!empty($socials)) {
                foreach ($socials as $social) {
                    if (isset($social['url']) && trim($social['url']) !== '') {
                        $platform = isset($social['platform']) && trim($social['platform']) !== '' ? $social['platform'] : null;
                        $member->socials()->create([
                            'social_url' => $social['url'],
                            'platform' => $platform,
                        ]);
                    }
                }
            }

            DB::commit();

            $newMember = Team::with('socials')->find($member->id);

            return response()->json([
                'message' => '✅ تم إضافة عضو الفريق بنجاح',
                'member' => $newMember->append('photo_url'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }
            Log::error('Error in TeamController@store:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة عضو الفريق', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified team member in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'language' => 'required|in:ar,en',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            'socials' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        DB::beginTransaction();
        try {
            $member = Team::find($id);

            if (!$member) {
                DB::rollBack();
                return response()->json(['error' => 'عضو الفريق غير موجود'], 404);
            }

            $currentPhotoPath = $member->photo;
            $newPhotoPath = $currentPhotoPath;

            if ($request->hasFile('photo')) {
                if ($currentPhotoPath && Storage::disk('public')->exists($currentPhotoPath)) {
                    Storage::disk('public')->delete($currentPhotoPath);
                }
                $newPhotoPath = $request->file('photo')->store('uploads/team', 'public');
            } elseif ($request->has('photo') && is_string($request->photo) && trim($request->photo) === '') {
                if ($currentPhotoPath && Storage::disk('public')->exists($currentPhotoPath)) {
                    Storage::disk('public')->delete($currentPhotoPath);
                }
                $newPhotoPath = null;
            }

            $member->update([
                'name' => $request->name,
                'position' => $request->position,
                'photo' => $newPhotoPath,
                'language' => $request->language,
            ]);

            $member->socials()->delete();
            $socials = json_decode($request->socials, true);
            if (!empty($socials)) {
                foreach ($socials as $social) {
                    if (isset($social['url']) && trim($social['url']) !== '') {
                        $platform = isset($social['platform']) && trim($social['platform']) !== '' ? $social['platform'] : null;
                        $member->socials()->create([
                            'social_url' => $social['url'],
                            'platform' => $platform,
                        ]);
                    }
                }
            }

            DB::commit();

            $updatedMember = Team::with('socials')->find($member->id);

            return response()->json([
                'message' => '✅ تم تحديث عضو الفريق بنجاح',
                'member' => $updatedMember->append('photo_url'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($newPhotoPath) && $request->hasFile('photo') && Storage::disk('public')->exists($newPhotoPath)) {
                Storage::disk('public')->delete($newPhotoPath);
            }
            Log::error('Error in TeamController@update:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث عضو الفريق', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified team member from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $member = Team::find($id);

            if (!$member) {
                DB::rollBack();
                return response()->json(['error' => 'عضو الفريق غير موجود'], 404);
            }

            $member->socials()->delete();
            if ($member->photo && Storage::disk('public')->exists($member->photo)) {
                Storage::disk('public')->delete($member->photo);
            }
            $member->delete();

            DB::commit();

            return response()->json(['message' => 'تم الحذف بنجاح']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in TeamController@destroy:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف عضو الفريق', 'details' => $e->getMessage()], 500);
        }
    }
}