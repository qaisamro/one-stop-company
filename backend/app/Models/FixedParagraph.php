<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FixedParagraph extends Model
{
    use HasFactory;

    protected $table = 'fixed_paragraphs';

    protected $fillable = [
        'paragraph_ar',
        'paragraph_en'
    ];
}
