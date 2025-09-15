<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    public function show($key)
    {
        try {
            $setting = Setting::where('key_name', $key)->first();

            if (!$setting) {
                return response()->json(['value' => null]);
            }

            $value = $setting->value;
            if ($key === 'projects_background_image' && $value) {
                $value = url($value);
            }

            return response()->json(['value' => $value]);
        } catch (\Exception $e) {
            Log::error('Error in getSetting:', ['key' => $key, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'خطأ داخلي في الخادم', 'details' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $key)
    {
        $validator = Validator::make($request->all(), [
            'value' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $setting = Setting::firstOrNew(['key_name' => $key]);
            $setting->value = $request->input('value');
            $setting->save();

            return response()->json(['message' => 'تم تحديث الإعداد بنجاح']);
        } catch (\Exception $e) {
            Log::error('Error in updateSetting:', ['key' => $key, 'value' => $request->value, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'فشل تحديث الإعداد', 'details' => $e->getMessage()], 500);
        }
    }
}