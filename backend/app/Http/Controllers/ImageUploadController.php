<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str; // لاستخدام Str::random أو Str::uuid

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        // 1. التحقق من صحة الملف
        // (حدود الحجم: 5 ميجابايت، الأنواع المسموح بها: jpeg, jpg, png, gif)
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120', // 5120 كيلوبايت = 5 ميجابايت
        ], [
            'image.required' => 'لم يتم تحميل أي ملف أو نوع ملف غير صالح.',
            'image.image' => 'يجب أن يكون الملف المحمل صورة.',
            'image.mimes' => 'فقط ملفات الصور (jpeg, jpg, png, gif) مسموح بها.',
            'image.max' => 'حجم الملف لا يمكن أن يتجاوز 5 ميجابايت.',
        ]);

        // 2. معالجة الملف المحمل
        if ($request->hasFile('image')) {
            $image = $request->file('image');

            // 3. تخزين الملف في مجلد 'uploads' داخل 'storage/app/public'
            // Laravel يستخدم نظام أقراص التخزين (Storage disks). القرص الافتراضي هو 'local'
            // ولكن لتحميل الملفات العامة، يُفضل استخدام القرص 'public'.
            // تأكد من تشغيل 'php artisan storage:link' لإنشاء رابط رمزي من public/storage إلى storage/app/public
            
            // توليد اسم فريد للملف
            $filename = time() . '-' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // التخزين على قرص 'public' داخل مجلد 'uploads'
            $path = $image->storeAs('uploads', $filename, 'public'); 
            // المسار سيعود كـ 'uploads/your-unique-filename.jpg'
            
            // 4. بناء الرابط (URL) للوصول إلى الصورة
            // إذا كنت تستخدم php artisan storage:link، فإن الملفات تكون متاحة عبر public/storage
            // رابط الـ URL سيكون بهذا الشكل: http://localhost:8000/storage/uploads/your-unique-filename.jpg
            $url = Storage::url($path); 

            // إذا كنت تفضل أن تكون الملفات في مجلد public/uploads مباشرةً كما في Node.js الخاص بك،
            // يمكنك تغيير المسار إلى:
            // $image->move(public_path('uploads'), $filename);
            // وفي هذه الحالة، الرابط سيكون: http://localhost:8000/uploads/your-unique-filename.jpg
            // ولكن الطريقة المفضلة في Laravel هي استخدام Storage Facade مع القرص 'public'.


            return response()->json([
                'url' => $url,
                'message' => 'تم تحميل الصورة بنجاح.'
            ]);
        }

        return response()->json(['error' => 'خطأ غير معروف في تحميل الملف.'], 500);
    }
}