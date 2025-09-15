<?php

namespace App\Http\Controllers;

use App\Models\FeaturesSection;
use App\Models\FeaturesItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class FeaturesController extends Controller
{
    /**
     * Display the features section and its items for a specific language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en');

        try {
            $section = FeaturesSection::where('language', $lang)->first();

            if (!$section) {
                return response()->json(['section' => null, 'items' => []]);
            }

            $items = FeaturesItem::where('section_id', $section->id)
                                 ->orderBy('tab_index', 'asc')
                                 ->get();

            $sectionData = $section->toArray();
            // تحويل المسار النسبي إلى URL كامل، مع التحقق من وجود الملف
            $sectionData['image_url'] = $section->image_url && Storage::disk('public')->exists($section->image_url)
                ? Storage::url($section->image_url)
                : null;

            $itemsData = $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'section_id' => $item->section_id,
                    'text' => $item->text,
                    'icon' => $item->icon,
                    'tab_index' => $item->tab_index,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

            return response()->json(['section' => $sectionData, 'items' => $itemsData]);
        } catch (\Exception $e) {
            Log::error('Error getting features data:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل استرداد بيانات الخصائص.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new features section.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeSection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'tab1_title' => 'nullable|string|max:255',
            'tab2_title' => 'nullable|string|max:255',
            'tab3_title' => 'nullable|string|max:255',
            'tab4_title' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:255',
            'button_url' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            'language' => 'required|string|in:ar,en|unique:features_sections,language',
            'delete_image' => 'nullable|boolean',
        ], [
            'title.required' => 'العنوان الرئيسي مطلوب.',
            'language.required' => 'اللغة مطلوبة.',
            'language.in' => 'اللغة يجب أن تكون إما ar أو en.',
            'language.unique' => 'اللغة المحددة مستخدمة بالفعل.',
            'button_url.url' => 'رابط الزر يجب أن يكون URL صالحًا (مثل https://example.com).',
            'image.image' => 'يجب أن يكون الملف صورة.',
            'image.mimes' => 'الصورة يجب أن تكون بصيغة: jpeg، jpg، png، أو gif.',
            'image.max' => 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.',
            'delete_image.boolean' => 'حقل حذف الصورة يجب أن يكون true أو false.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/Features', 'public');
            }

            $sectionData = [
                'language' => $request->language,
                'title' => $request->title,
                'subtitle' => $request->subtitle,
                'description' => $request->description,
                'tab1_title' => $request->tab1_title,
                'tab2_title' => $request->tab2_title,
                'tab3_title' => $request->tab3_title,
                'tab4_title' => $request->tab4_title,
                'button_text' => $request->button_text,
                'button_url' => $request->button_url,
                'image_url' => $imagePath,
            ];

            $section = FeaturesSection::create($sectionData);

            return response()->json([
                'message' => 'تم إنشاء القسم بنجاح.',
                'section' => array_merge($section->toArray(), [
                    'image_url' => $section->image_url ? Storage::url($section->image_url) : null
                ])
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating features section:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إنشاء القسم.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing features section.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSection(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'required|string|in:ar,en',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'tab1_title' => 'nullable|string|max:255',
            'tab2_title' => 'nullable|string|max:255',
            'tab3_title' => 'nullable|string|max:255',
            'tab4_title' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:255',
            'button_url' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            'delete_image' => 'nullable|boolean',
        ], [
            'language.required' => 'اللغة مطلوبة.',
            'language.in' => 'اللغة يجب أن تكون إما ar أو en.',
            'title.required' => 'العنوان الرئيسي مطلوب.',
            'button_url.url' => 'رابط الزر يجب أن يكون URL صالحًا (مثل https://example.com).',
            'image.image' => 'يجب أن يكون الملف صورة.',
            'image.mimes' => 'الصورة يجب أن تكون بصيغة: jpeg، jpg، png، أو gif.',
            'image.max' => 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.',
            'delete_image.boolean' => 'حقل حذف الصورة يجب أن يكون true أو false.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $section = FeaturesSection::where('id', $id)->where('language', $request->language)->firstOrFail();

            $imagePath = $section->image_url;

            if ($request->hasFile('image')) {
                if ($section->image_url && Storage::disk('public')->exists($section->image_url)) {
                    Storage::disk('public')->delete($section->image_url);
                }
                $imagePath = $request->file('image')->store('uploads/Features', 'public');
            } elseif ($request->has('delete_image') && filter_var($request->input('delete_image'), FILTER_VALIDATE_BOOLEAN)) {
                if ($section->image_url && Storage::disk('public')->exists($section->image_url)) {
                    Storage::disk('public')->delete($section->image_url);
                }
                $imagePath = null;
            }

            $updateData = [
                'title' => $request->title,
                'subtitle' => $request->subtitle,
                'description' => $request->description,
                'tab1_title' => $request->tab1_title,
                'tab2_title' => $request->tab2_title,
                'tab3_title' => $request->tab3_title,
                'tab4_title' => $request->tab4_title,
                'button_text' => $request->button_text,
                'button_url' => $request->button_url,
                'image_url' => $imagePath,
            ];

            $section->update($updateData);

            return response()->json([
                'message' => 'تم تحديث القسم بنجاح.',
                'section' => array_merge($section->toArray(), [
                    'image_url' => $section->image_url && Storage::disk('public')->exists($section->image_url)
                        ? Storage::url($section->image_url)
                        : null
                ])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'القسم غير موجود للغة المحددة.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error updating features section:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث القسم.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a features section.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroySection($id)
    {
        try {
            $section = FeaturesSection::findOrFail($id);
            if ($section->image_url && Storage::disk('public')->exists($section->image_url)) {
                Storage::disk('public')->delete($section->image_url);
            }
            $section->delete();
            FeaturesItem::where('section_id', $id)->delete();

            return response()->json(['message' => 'تم حذف القسم بنجاح.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'القسم غير موجود.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting features section:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف القسم.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Add a new item to a features section.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $section_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeItem(Request $request, $section_id)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'tab_index' => 'required|integer|min:0|max:3',
            'language' => 'required|string|in:ar,en',
        ], [
            'text.required' => 'نص الميزة مطلوب.',
            'tab_index.required' => 'مؤشر التبويب مطلوب.',
            'tab_index.integer' => 'مؤشر التبويب يجب أن يكون عددًا صحيحًا.',
            'tab_index.min' => 'مؤشر التبويب يجب أن يكون 0 أو أكثر.',
            'tab_index.max' => 'مؤشر التبويب يجب أن يكون 3 أو أقل.',
            'language.required' => 'اللغة مطلوبة.',
            'language.in' => 'اللغة يجب أن تكون إما ar أو en.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $section = FeaturesSection::findOrFail($section_id);

            $itemData = [
                'section_id' => $section_id,
                'tab_index' => $request->tab_index,
                'icon' => $request->icon,
                'text' => $request->text,
            ];

            $item = FeaturesItem::create($itemData);

            return response()->json([
                'message' => 'تمت إضافة العنصر بنجاح.',
                'item' => $item
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'القسم غير موجود.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error adding features item:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل إضافة العنصر.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a features item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyItem($id)
    {
        try {
            $item = FeaturesItem::findOrFail($id);
            $item->delete();

            return response()->json(['message' => 'تم حذف العنصر بنجاح.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'العنصر غير موجود.', 'details' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting features item:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل حذف العنصر.', 'details' => $e->getMessage()], 500);
        }
    }
}