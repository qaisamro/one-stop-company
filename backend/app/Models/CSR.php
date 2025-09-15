<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CSR extends Model
{
    use HasFactory;

    protected $table = 'csr';

    protected $fillable = [
        'title_ar',
        'title_en',
        'paragraph_ar',
        'paragraph_en',
        'description_ar',
        'description_en',
        'image',
        'additional_images',
    ];

    protected $casts = [
        'additional_images' => 'array',
    ];
}
