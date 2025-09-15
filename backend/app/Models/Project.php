<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $table = 'projects';

    protected $fillable = [
        'title',
        'description',
        'image',
        'url',
        'language',
        'detailed_description',
        'additional_images',
        'extra_title',
        'title_description',
        'sections',
    ];

    protected $casts = [
        'additional_images' => 'array',
        'sections' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function getAllProjects(string $lang)
    {
        return self::where('language', $lang)->select([
            'id',
            'title',
            'description',
            'image',
            'url',
            'language',
            'detailed_description',
            'additional_images',
            'extra_title',
            'title_description',
            'sections',
            'created_at',
            'updated_at',
        ])->get();
    }

    public static function getProjectById(int $id)
    {
        return self::find($id);
    }
}