<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Handle Admin Registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // التحقق من صحة البيانات المدخلة
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            Log::warning('Admin registration validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // إنشاء مسؤول جديد
            $admin = Admin::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // إنشاء رمز توثيق Sanctum
            $token = $admin->createToken('auth_token')->plainTextToken;

            Log::info('Admin registered successfully', ['email' => $admin->email, 'id' => $admin->id]);

            return response()->json([
                'message' => 'Admin registered successfully!',
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error during admin registration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to register admin.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Admin Login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // التحقق من صحة البيانات المدخلة
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::warning('Admin login validation failed', [
                'email' => $request->email,
                'errors' => $validator->errors()
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // البحث عن المسؤول بواسطة البريد الإلكتروني
        $admin = Admin::where('email', $request->email)->first();

        // التحقق من وجود المسؤول
        if (!$admin) {
            Log::warning('Admin not found for login attempt', ['email' => $request->email]);
            return response()->json(['message' => 'Email or password incorrect'], 401);
        }

        // التحقق من صحة كلمة المرور
        if (!Hash::check($request->password, $admin->password)) {
            Log::warning('Invalid password for admin', ['email' => $request->email]);
            return response()->json(['message' => 'Email or password incorrect'], 401);
        }

        // حذف التوكنات السابقة (اختياري لضمان توكن واحد نشط)
        $admin->tokens()->delete();

        // إنشاء رمز توثيق Sanctum جديد
        $token = $admin->createToken('auth_token')->plainTextToken;

        Log::info('Admin logged in successfully', ['email' => $admin->email, 'id' => $admin->id, 'token' => $token]);

        return response()->json([
            'message' => 'Logged in successfully!',
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Handle Admin Logout.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user('sanctum');
        if ($user) {
            $user->currentAccessToken()->delete();
            Log::info('Admin logged out successfully', ['email' => $user->email]);
            return response()->json(['message' => 'Logged out successfully.'], 200);
        }

        Log::warning('No authenticated admin for logout');
        return response()->json(['message' => 'No authenticated admin to log out.'], 401);
    }
}