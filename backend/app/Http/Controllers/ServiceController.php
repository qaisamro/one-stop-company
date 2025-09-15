<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // تأكد من إضافة هذا السطر

class ServiceController extends Controller
{
    /**
     * Display a listing of the services based on language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // القيمة الافتراضية للغة هي 'en'
        $lang = $request->query('lang', 'en');

        try {
            // جلب الخدمات التي تتطابق مع اللغة المطلوبة فقط
            $services = Service::where('language', $lang)->get();

            // لا حاجة لتعيين 'title' و 'description' من حقول متعددة اللغات
            // لأن كل سجل هو بالفعل للغة المطلوبة
            return response()->json($services);
        } catch (\Exception $e) {
            \Log::error('Error in getServices:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator(request()->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255', // يمكن أن تكون الأيقونة اختيارية
            'language' => ['required', Rule::in(['ar', 'en'])], // ضمان أن اللغة هي 'ar' أو 'en'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            // إنشاء سجل خدمة جديد باللغة المحددة
            $service = Service::create([
                'title' => $request->title,
                'description' => $request->description,
                'icon' => $request->icon,
                'language' => $request->language, // تخزين اللغة في العمود المخصص
            ]);

            return response()->json([
                'message' => 'Service added successfully',
                'service' => $service // إرجاع كائن الخدمة بالكامل
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error in createService:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to add service', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator(request()->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'language' => ['required', Rule::in(['ar', 'en'])], // ضمان أن اللغة هي 'ar' أو 'en'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json(['error' => 'Service not found'], 404);
            }

            // تحديث الحقول مباشرة في السجل المحدد
            $service->update([
                'title' => $request->title,
                'description' => $request->description,
                'icon' => $request->icon,
                'language' => $request->language, // تحديث اللغة (يمكن أن يكون غير ضروري إذا لم يتم تغيير اللغة)
            ]);

            return response()->json(['message' => 'Service updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Error in updateService:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to update service', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified service from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json(['error' => 'Service not found'], 404);
            }

            $service->delete();

            return response()->json(['message' => 'Service deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error in deleteService:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete service', 'details' => $e->getMessage()], 500);
        }
    }
}