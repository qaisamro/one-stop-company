<?php

namespace App\Http\Controllers;

use App\Models\HeaderLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HeaderLinkController extends Controller
{
    /**
     * Display a listing of the header links for a specific language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar');
        app()->setLocale($lang); // تعيين لغة التطبيق لجعل Accessors تعمل بشكل صحيح

        try {
            // جلب جميع الروابط، سيتم جلب الحقول المترجمة عبر Accessors
            $links = HeaderLink::where('language', $lang)->get()->map(function ($link) {
                return [
                    'id' => $link->id,
                    'label' => $link->label, // Accessor سيجلب label_ar أو label_en
                    'href' => $link->href,
                    'isSection' => (bool) $link->isSection,
                    'content' => $link->content, // Accessor سيجلب content_ar أو content_en
                    'language' => $link->language,
                    'created_at' => $link->created_at,
                    'updated_at' => $link->updated_at,
                ];
            });

            return response()->json($links);
        } catch (\Exception $e) {
            Log::error('Error in getHeaderLinks:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created header link in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'language' => 'required|string|in:ar,en',
            'isSection' => 'boolean',
            'content' => 'nullable|string',
        ]);

        try {
            // إنشاء الأعمدة بناءً على اللغة
            $linkData = [
                'language' => $request->language,
                'label_' . $request->language => $request->label,
                'href' => $request->href,
                'isSection' => $request->isSection ?? false,
                'content_' . $request->language => $request->content,
            ];

            $newLink = HeaderLink::create($linkData);

            return response()->json([
                'message' => 'تمت إضافة الرابط بنجاح.',
                'link' => $newLink
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in addHeaderLink:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة الرابط.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified header link in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'language' => 'required|string|in:ar,en',
            'isSection' => 'boolean',
            'content' => 'nullable|string',
        ]);

        try {
            $link = HeaderLink::findOrFail($id);

            // تحديث الأعمدة بناءً على اللغة
            $updateData = [
                'href' => $request->href,
                'isSection' => $request->isSection ?? false,
                'language' => $request->language, // قد تحتاج إلى تحديث اللغة إذا تغيرت
                'label_' . $request->language => $request->label,
                'content_' . $request->language => $request->content,
            ];

            $link->update($updateData);

            return response()->json(['message' => 'تم تحديث الرابط بنجاح.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'الرابط غير موجود.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error in updateHeaderLink:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث الرابط.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified header link from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $link = HeaderLink::findOrFail($id);
            $link->delete();

            return response()->json(['message' => 'تم حذف الرابط بنجاح.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'الرابط غير موجود.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error in deleteHeaderLink:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف الرابط.', 'details' => $e->getMessage()], 500);
        }
    }
}