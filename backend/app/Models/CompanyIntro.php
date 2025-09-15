<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyIntro extends Model
{
    use HasFactory;

    protected $table = 'company_intro';

    protected $fillable = [
        'title',
        'images',
        'language',
        'description',
    ];

    protected $casts = [
        'images' => 'array', // **حافظ على هذا السطر كما هو**
        'description' => 'array', // إذا كان description أيضاً مصفوفة JSON
    ];
}