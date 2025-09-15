<?php

namespace App\Http\Controllers;

use App\Models\CompanyIntro; // تأكد من استيراد النموذج
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // لاستخدام نظام الملفات
use Illuminate\Support\Facades\Log;     // لتسجيل الأخطاء

class CompanyIntroController extends Controller
{
    /**
     * Display the company introduction for a specific language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'ar'); // القيمة الافتراضية 'ar'

        $intro = CompanyIntro::where('language', $lang)->first();

        $introData = [
            'title' => $intro ? $intro->title : '',
            'description' => $intro && is_array($intro->description) ? $intro->description : [],
            'images' => $intro && is_array($intro->images) ? $intro->images : []
        ];

        // تحويل مسارات الصور إلى URLs قابلة للوصول
        // هذا هو الجزء الذي تم تعديله ليعطي المسار الصحيح
        $introData['images'] = collect($introData['images'])->map(function ($imagePath) {
            // $imagePath يأتي من DB على شكل 'uploads/filename.jpg'
            // Storage::url($imagePath) ستحوله إلى '/storage/uploads/filename.jpg'
            // asset(...) ستقوم بتركيب الدومين ليعطي http://localhost:8000/storage/uploads/filename.jpg
            return asset(Storage::url($imagePath));
        })->toArray();

        return response()->json($introData);
    }

    /**
     * Update the content (title and description) of the company introduction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateContent(Request $request)
    {
        // التحقق من صحة البيانات المدخلة
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|array', // الوصف يجب أن يكون مصفوفة
            'description.*' => 'string', // كل عنصر في المصفوفة يجب أن يكون نصاً
            'language' => 'required|string|in:ar,en',
        ]);

        $language = $request->language;
        $title = $request->title;
        $description = $request->description; // سيكون مصفوفة بفضل Validation and Laravel's handling

        try {
            // البحث عن سجل موجود أو إنشاء واحد جديد
            $intro = CompanyIntro::firstOrNew(['language' => $language]);

            $intro->title = $title;
            $intro->description = $description; // Laravel سيقوم بـ JSON encode تلقائياً بفضل $casts

            // إذا كان السجل جديداً، قم بتهيئة حقل الصور كمصفوفة فارغة إذا لم يتم تهيئته
            if (!$intro->exists && !isset($intro->images)) {
                $intro->images = [];
            }

            $intro->save(); // حفظ أو تحديث السجل

            return response()->json(['message' => 'تم تحديث المحتوى بنجاح!']);
        } catch (\Exception $e) {
            Log::error('Error updating company intro content:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث المحتوى.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Add an image to the company introduction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // الصورة مطلوبة
            'language' => 'required|string|in:ar,en',
        ]);

        $language = $request->language;
        $uploadedImagePath = null;

        if ($request->hasFile('image')) {
            // تخزين الملف في 'storage/app/public/uploads'
            // وسيعيد المسار النسبي: 'uploads/filename.jpg'
            $uploadedImagePath = $request->file('image')->store('uploads', 'public');
        }

        try {
            $intro = CompanyIntro::firstOrNew(['language' => $language]);

            // إذا كان السجل جديداً، قم بتهيئة حقل الصور كمصفوفة فارغة
            if (!$intro->exists) {
                $intro->images = [];
                $intro->title = ''; // Set default title/description if new entry
                $intro->description = [];
            }

            $currentImages = is_array($intro->images) ? $intro->images : [];
            $currentImages[] = $uploadedImagePath; // إضافة المسار النسبي الجديد

            $intro->images = $currentImages; // Laravel سيقوم بـ JSON encode تلقائياً
            $intro->save();

            // إرجاع المسار الكامل للصورة الجديدة
            return response()->json(['message' => 'تمت إضافة الصورة بنجاح!', 'image_url' => asset(Storage::url($uploadedImagePath))]);
        } catch (\Exception $e) {
            // حذف الصورة المحملة إذا فشل إدخال قاعدة البيانات
            if ($uploadedImagePath && Storage::disk('public')->exists($uploadedImagePath)) {
                Storage::disk('public')->delete($uploadedImagePath);
            }
            Log::error('Error adding image to company intro:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة الصورة.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete an image from the company introduction by index.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $index
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteImage(Request $request, $index)
    {
        $request->validate([
            'language' => 'required|string|in:ar,en',
        ]);

        $language = $request->language;
        $imageIndex = (int) $index; // تحويل الفهرس إلى عدد صحيح

        $intro = CompanyIntro::where('language', $language)->first();

        if (!$intro) {
            return response()->json(['error' => 'لا توجد بيانات تعريفية لهذه اللغة.'], 404);
        }

        $currentImages = is_array($intro->images) ? $intro->images : [];

        if ($imageIndex < 0 || $imageIndex >= count($currentImages)) {
            return response()->json(['error' => 'فهرس الصورة غير صالح.'], 400);
        }

        $deletedImagePath = $currentImages[$imageIndex]; // المسار النسبي للصورة المراد حذفها

        // إزالة الصورة من المصفوفة
        array_splice($currentImages, $imageIndex, 1);
        $intro->images = $currentImages; // Laravel سيقوم بـ JSON encode تلقائياً

        try {
            $intro->save();

            // حذف الملف الفعلي من التخزين
            if ($deletedImagePath && Storage::disk('public')->exists($deletedImagePath)) {
                Storage::disk('public')->delete($deletedImagePath);
            }

            return response()->json(['message' => 'تم حذف الصورة بنجاح!']);
        } catch (\Exception $e) {
            Log::error('Error deleting image from company intro:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف الصورة.', 'details' => $e->getMessage()], 500);
        }
    }
}