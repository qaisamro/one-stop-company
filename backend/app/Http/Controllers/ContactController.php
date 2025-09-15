<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // For error logging

class ContactController extends Controller
{
    /**
     * Display a listing of the contacts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Fetch all contact messages, ordered by newest first
            $contacts = Contact::orderBy('created_at', 'desc')->get();
            return response()->json($contacts);
        } catch (\Exception $e) {
            Log::error('Error fetching contacts:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'An internal server error occurred while fetching messages.'], 500);
        }
    }

    /**
     * Store a newly created contact message in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'message' => 'required|string',
        ]);

        try {
            // Create a new record in the database
            $newContact = Contact::create([
                'name' => $request->name,
                'email' => $request->email,
                'message' => $request->message,
            ]);

            return response()->json([
                'message' => 'تم إرسال الرسالة بنجاح.',
                'contact' => $newContact // Return the created contact record
            ], 201); // 201 Created
        } catch (\Exception $e) {
            Log::error('Error storing contact:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to send message.', 'details' => $e->getMessage()], 500);
        }
    }
}