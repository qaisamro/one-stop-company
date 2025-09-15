<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'language',
        'title',
        'content',
        'image_url',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'story';

    // لا توجد تغييرات هنا
}