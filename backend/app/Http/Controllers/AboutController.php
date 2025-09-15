<?php

namespace App\Http\Controllers;

use App\Models\AboutUsModel; // Using AboutUsModel as per user's code
use App\Models\AboutBlockModel; // Using AboutBlockModel as per user's code
use App\Models\AboutFeatureModel; // Using AboutFeatureModel as per user's code
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon; // Import Carbon for timestamps

class AboutController extends Controller
{
    /**
     * جلب بيانات "من نحن" مع الكتل والميزات حسب اللغة.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAbout(Request $request)
    {
        $language = $request->query('lang', 'en');

        Log::info('getAbout استدعيت:', [
            'language' => $language,
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
            'query' => $request->query(),
        ]);

        try {
            $validator = Validator::make(['language' => $language], [
                'language' => 'required|string|in:en,ar',
            ], [
                'language.required' => $language === 'ar' ? 'حقل اللغة مطلوب.' : 'The language field is required.',
                'language.in' => $language === 'ar' ? 'اللغة يجب أن تكون "en" أو "ar".' : 'The language must be "en" or "ar".',
            ]);

            if ($validator->fails()) {
                Log::warning('لغة غير صالحة في getAbout:', ['errors' => $validator->errors()->toArray()]);
                return response()->json([
                    'error' => $language === 'ar' ? 'اللغة غير صالحة.' : 'Invalid language.',
                    'errors' => $validator->errors()->toArray(),
                ], 422);
            }

            $aboutData = AboutUsModel::with(['blocks' => function ($query) {
                $query->orderBy('order_index');
            }, 'features' => function ($query) {
                $query->orderBy('order_index');
            }])
                ->where('language', $language)
                ->first();

            if (!$aboutData) {
                Log::info('لم يتم العثور على بيانات للغة:', ['language' => $language]);
                return response()->json([
                    'title_small' => '',
                    'title_main' => '',
                    'description' => '',
                    'image_url' => '',
                    'experience_year' => null,
                    'experience_text' => '',
                    'button_text' => '',
                    'button_url' => '',
                    'blocks' => [],
                    'features' => [],
                ], 200);
            }

            if ($aboutData->image_url && Storage::disk('public')->exists($aboutData->image_url)) {
                $aboutData->image_url = asset(Storage::url($aboutData->image_url));
            } else {
                $aboutData->image_url = '';
            }

            Log::info('تم جلب بيانات "من نحن" بنجاح:', ['language' => $language, 'id' => $aboutData->id]);

            return response()->json($aboutData, 200);
        } catch (\Exception $e) {
            Log::error('خطأ في getAbout:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'language' => $language,
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'error' => $language === 'ar' ? 'فشل في جلب محتوى صفحة من نحن.' : 'Failed to fetch about content.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * جلب تفاصيل "من نحن" حسب اللغة.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAboutDetails(Request $request)
    {
        $language = $request->query('lang', 'en');

        Log::info('getAboutDetails استدعيت:', [
            'language' => $language,
            'ip' => $request->ip(),
        ]);

        try {
            $aboutData = AboutUsModel::with(['features' => function ($query) {
                $query->orderBy('order_index');
            }])
                ->where('language', $language)
                ->select('id', 'description AS content')
                ->first();

            if (!$aboutData) {
                Log::info('لم يتم العثور على تفاصيل للغة:', ['language' => $language]);
                return response()->json(['content' => '', 'features' => []], 200);
            }

            return response()->json($aboutData, 200);
        } catch (\Exception $e) {
            Log::error('خطأ في getAboutDetails:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'language' => $language,
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'error' => $language === 'ar' ? 'فشل في جلب تفاصيل صفحة من نحن.' : 'Failed to fetch about details.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * تحديث أو إدراج محتوى "من نحن".
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAbout(Request $request)
    {
        // تسجيل بيانات الطلب للتصحيح
        $formData = [];
        foreach ($request->all() as $key => $value) {
            if ($key === 'image_file') {
                $formData[$key] = $request->hasFile('image_file') ? $request->file('image_file')->getClientOriginalName() : null;
            } else {
                $formData[$key] = $value;
            }
        }
        Log::info('تم استقبال طلب تحديث "من نحن":', [
            'headers' => $request->headers->all(),
            'data' => $formData,
            'has_lang' => $request->has('lang'),
            'lang_value' => $request->input('lang'),
            'ip' => $request->ip(),
        ]);

        // التحقق من صحة بيانات الطلب
        $language = $request->input('lang', 'en'); // قيمة افتراضية 'en' إذا لم يتم إرسال lang
        $validator = Validator::make($request->all(), [
            'lang' => 'nullable|string|in:en,ar',
            'title_small' => 'nullable|string|max:255',
            'title_main' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'current_image_url' => 'nullable|string',
            'delete_image' => 'nullable|boolean',
            'experience_year' => 'nullable|integer',
            'experience_text' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:255',
            // blocks and features are sent as JSON strings, so validate as string and then decode
            'blocks' => 'nullable|string', // Validate as string
            'features' => 'nullable|string', // Validate as string
        ], [
            'lang.in' => $language === 'ar' ? 'اللغة يجب أن تكون "en" أو "ar".' : 'The lang must be "en" or "ar".',
            'image_file.image' => $language === 'ar' ? 'الملف المحمل يجب أن يكون صورة.' : 'The uploaded file must be an image.',
            'image_file.mimes' => $language === 'ar' ? 'صيغ الصور المدعومة هي: jpeg, jpg, png, gif.' : 'Supported image formats are: jpeg, jpg, png, gif.',
            'image_file.max' => $language === 'ar' ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.' : 'The image size must not exceed 5MB.',
            'blocks.string' => $language === 'ar' ? 'البيانات الخاصة بالـ blocks يجب أن تكون نصية (JSON).' : 'The blocks data must be a string (JSON).',
            'features.string' => $language === 'ar' ? 'البيانات الخاصة بالـ features يجب أن تكون نصية (JSON).' : 'The features data must be a string (JSON).',
        ]);

        if ($validator->fails()) {
            Log::warning('خطأ في التحقق من البيانات في updateAbout:', [
                'errors' => $validator->errors()->toArray(),
                'request' => $formData,
            ]);
            return response()->json([
                'error' => $language === 'ar' ? 'فشل التحقق من البيانات.' : 'Validation failed.',
                'errors' => $validator->errors()->toArray(),
            ], 422);
        }

        try {
            $imagePath = null;
            $aboutUs = AboutUsModel::where('language', $language)->first();

            // Store the current image path if it exists
            if ($aboutUs && $aboutUs->image_url && Storage::disk('public')->exists($aboutUs->image_url)) {
                $imagePath = $aboutUs->image_url;
            }

            // Handle image deletion or new upload
            if ($request->input('delete_image')) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Log::info('حذف الصورة القديمة:', ['path' => $imagePath]);
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = null; // Clear image path after deletion
            } elseif ($request->hasFile('image_file')) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Log::info('استبدال الصورة القديمة:', ['old_path' => $imagePath]);
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = $request->file('image_file')->storeAs(
                    'uploads/about', // <--- تم التعديل هنا
                    time() . '-' . $request->file('image_file')->getClientOriginalName(),
                    'public'
                );
                Log::info('تم تحميل صورة جديدة:', ['path' => $imagePath]);
            } elseif ($request->input('current_image_url')) {
                // If current_image_url is provided, use it and verify existence
                $imagePath = $request->input('current_image_url');
                // Adjust path if it's a full URL from asset(Storage::url())
                $imagePath = str_replace(asset('storage'), 'uploads', $imagePath);
                $imagePath = ltrim($imagePath, '/'); // Remove leading slash if 'uploads' is not at root
                // For 'uploads/about', we need to ensure the path is correct if coming from frontend with a full URL
                if (strpos($imagePath, 'uploads/') !== 0) {
                     $imagePath = 'uploads/' . $imagePath; // Prepend 'uploads/' if it's missing (might be needed for existing images)
                }
                if (!Storage::disk('public')->exists($imagePath)) {
                    $imagePath = null; // If the provided URL doesn't exist as a file, treat as null
                }
            }

            // تحليل بيانات JSON بعد التحقق الأولي كـ string
            $blocksData = $request->input('blocks') ? json_decode($request->input('blocks'), true) : [];
            $featuresData = $request->input('features') ? json_decode($request->input('features'), true) : [];

            // التحقق من هيكلية JSON بعد فك التشفير
            if (!is_array($blocksData)) {
                Log::error('تنسيق JSON غير صالح للكتل بعد فك التشفير:', ['blocks' => $request->input('blocks')]);
                return response()->json([
                    'error' => $language === 'ar' ? 'البيانات الخاصة بالـ blocks غير صالحة.' : 'The blocks data is invalid.',
                ], 422);
            }
            if (!is_array($featuresData)) {
                Log::error('تنسيق JSON غير صالح للميزات بعد فك التشفير:', ['features' => $request->input('features')]);
                return response()->json([
                    'error' => $language === 'ar' ? 'البيانات الخاصة بالـ features غير صالحة.' : 'The features data is invalid.',
                ], 422);
            }

            // التحقق من هيكلية الكتل والميزات
            foreach ($blocksData as $index => $block) {
                // Using array_key_exists for description as it might be null/empty but should be present
                if (!isset($block['block_title']) || !array_key_exists('block_description', $block)) {
                    Log::error('هيكلية كتلة غير صالحة:', ['block' => $block, 'index' => $index]);
                    return response()->json([
                        'error' => $language === 'ar' ? 'بنية البيانات في blocks غير صالحة (مطلوب block_title و block_description).' : 'The blocks data structure is invalid (block_title and block_description are required).',
                    ], 422);
                }
            }
            foreach ($featuresData as $index => $feature) {
                // Using array_key_exists for description as it might be null/empty but should be present
                if (!isset($feature['title']) || !array_key_exists('description', $feature)) {
                    Log::error('هيكلية ميزة غير صالحة:', ['feature' => $feature, 'index' => $index]);
                    return response()->json([
                        'error' => $language === 'ar' ? 'بنية البيانات في features غير صالحة (مطلوب title و description).' : 'The features data structure is invalid (title and description are required).',
                    ], 422);
                }
            }

            // إعداد البيانات للتحديث
            $contentToUpdate = [
                'language' => $language,
                'title_small' => $request->input('title_small'),
                'title_main' => $request->input('title_main'),
                'description' => $request->input('description'),
                'image_url' => $imagePath,
                'experience_year' => $request->input('experience_year') ? (int)$request->input('experience_year') : null,
                'experience_text' => $request->input('experience_text'),
                'button_text' => $request->input('button_text'),
                'button_url' => $request->input('button_url'),
            ];

            // تحديث أو إنشاء السجل ضمن معاملة
            $updatedAboutUs = DB::transaction(function () use ($language, $contentToUpdate, $blocksData, $featuresData) {
                // Use firstOrNew to find or initialize the model
                $aboutUs = AboutUsModel::firstOrNew(['language' => $language]);

                // Fill the model with the attributes to update/create
                $aboutUs->fill($contentToUpdate);
                $aboutUs->save(); // This will perform the insert or update

                // تحديث الكتل
                $aboutUs->blocks()->delete(); // Delete all existing blocks for this about_id
                if (!empty($blocksData)) {
                    $blocksToInsert = [];
                    foreach ($blocksData as $index => $block) {
                        // Only insert if title or description are not empty
                        if (!empty($block['block_title']) || !empty($block['block_description'])) {
                            $blocksToInsert[] = new AboutBlockModel([
                                'about_id' => $aboutUs->id,
                                'language' => $language,
                                'block_title' => $block['block_title'] ?? null,
                                'block_description' => $block['block_description'] ?? null,
                                'order_index' => $index,
                                'created_at' => Carbon::now(), // Use Carbon for timestamps
                            ]);
                        }
                    }
                    if (!empty($blocksToInsert)) {
                        $aboutUs->blocks()->saveMany($blocksToInsert); // Insert new blocks
                        Log::info('تم حفظ الكتل:', ['language' => $language, 'count' => count($blocksToInsert)]);
                    }
                }

                // تحديث الميزات
                $aboutUs->features()->delete(); // Delete all existing features for this about_id
                if (!empty($featuresData)) {
                    $featuresToInsert = [];
                    foreach ($featuresData as $index => $feature) {
                        // Only insert if title or description are not empty
                        if (!empty($feature['title']) || !empty($feature['description'])) {
                            $featuresToInsert[] = new AboutFeatureModel([
                                'about_id' => $aboutUs->id,
                                'language' => $language,
                                'title' => $feature['title'] ?? null,
                                'description' => $feature['description'] ?? null,
                                'order_index' => $index,
                                'created_at' => Carbon::now(), // Use Carbon for timestamps
                            ]);
                        }
                    }
                    if (!empty($featuresToInsert)) {
                        $aboutUs->features()->saveMany($featuresToInsert); // Insert new features
                        Log::info('تم حفظ الميزات:', ['language' => $language, 'count' => count($featuresToInsert)]);
                    }
                }

                return $aboutUs;
            });

            // جلب البيانات المحدثة مع رابط الصورة الكامل
            $updatedAboutUs = AboutUsModel::with(['blocks' => function ($query) {
                $query->orderBy('order_index');
            }, 'features' => function ($query) {
                $query->orderBy('order_index');
            }])
                ->where('language', $language)
                ->first();

            // Ensure image_url is an absolute URL for the frontend
            if ($updatedAboutUs && $updatedAboutUs->image_url && Storage::disk('public')->exists($updatedAboutUs->image_url)) {
                $updatedAboutUs->image_url = asset(Storage::url($updatedAboutUs->image_url));
            } else {
                $updatedAboutUs->image_url = '';
            }

            Log::info('تم تحديث محتوى "من نحن" بنجاح:', [
                'language' => $language,
                'user_id' => $request->user('sanctum') ? $request->user('sanctum')->id : null,
            ]);

            return response()->json([
                'message' => $language === 'ar' ? '✅ تم التحديث بنجاح!' : '✅ Updated successfully!',
                'data' => $updatedAboutUs,
            ], 200);
        } catch (\Exception $e) {
            Log::error('خطأ في updateAbout:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $formData,
                'language' => $language,
            ]);
            // If an image was uploaded during this request, attempt to delete it on error
            if ($request->hasFile('image_file') && $imagePath && Storage::disk('public')->exists($imagePath)) {
                Log::info('التراجع عن تحميل الصورة:', ['path' => $imagePath]);
                Storage::disk('public')->delete($imagePath);
            }
            return response()->json([
                'error' => $language === 'ar' ? 'حدث خطأ أثناء معالجة البيانات.' : 'An error occurred while processing the data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}