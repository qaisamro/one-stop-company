<?php

namespace App\Http\Controllers;

use App\Models\Statistic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class StatisticController extends Controller
{
    /**
     * Display a listing of the statistics based on language.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en');

        try {
            $statistics = Statistic::where('language', $lang)->get()->map(function ($stat) use ($lang) {
                return [
                    'id' => $stat->id,
                    'label' => $stat->label,
                    'value' => $stat->value,
                    'icon' => $stat->icon,
                    'language' => $stat->language,
                    'created_at' => $stat->created_at,
                    'updated_at' => $stat->updated_at,
                ];
            });

            return response()->json($statistics);
        } catch (\Exception $e) {
            Log::error('Error in getStats:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to retrieve statistics.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created statistic in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'value' => 'required|integer',
            'icon' => 'nullable|string|max:255',
            'language' => 'required|in:ar,en',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $statData = [
                'label' => $request->label,
                'value' => $request->value,
                'icon' => $request->icon ?? null,
                'language' => $request->language,
            ];

            $statistic = Statistic::create($statData);

            return response()->json([
                'message' => 'Statistic added successfully',
                'stat' => [
                    'id' => $statistic->id,
                    'label' => $statistic->label,
                    'value' => $statistic->value,
                    'icon' => $statistic->icon,
                    'language' => $statistic->language,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in createStat:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to add statistic', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified statistic in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'value' => 'required|integer',
            'icon' => 'nullable|string|max:255',
            'language' => 'required|in:ar,en',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $statistic = Statistic::find($id);

            if (!$statistic) {
                return response()->json(['error' => 'Statistic not found'], 404);
            }

            $statistic->update([
                'label' => $request->label,
                'value' => $request->value,
                'icon' => $request->icon ?? null,
                'language' => $request->language,
            ]);

            return response()->json(['message' => 'Statistic updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error in updateStat:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to update statistic', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified statistic from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $statistic = Statistic::find($id);

            if (!$statistic) {
                return response()->json(['error' => 'Statistic not found'], 404);
            }

            $statistic->delete();

            return response()->json(['message' => 'Statistic deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error in deleteStat:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to delete statistic', 'details' => $e->getMessage()], 500);
        }
    }
}