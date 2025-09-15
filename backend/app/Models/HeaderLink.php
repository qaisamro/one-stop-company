<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeaderLink extends Model
{
    use HasFactory;

    protected $table = 'header_links';

    protected $fillable = [
        'label_ar', 'label_en',
        'href',
        'isSection',
        'content_ar', 'content_en',
        'language', // هذا العمود سيحدد اللغة الأساسية للسجل (مفيد للفلترة)
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'isSection' => 'boolean',
    ];

    // Accessors لتبسيط الوصول إلى الحقول المترجمة
    public function getLabelAttribute()
    {
        $lang = app()->getLocale(); // استخدام لغة التطبيق الحالية
        return $this->attributes['label_' . $lang] ?? $this->attributes['label_en']; // افتراضيًا الإنجليزية
    }

    public function getContentAttribute()
    {
        $lang = app()->getLocale();
        return $this->attributes['content_' . $lang] ?? $this->attributes['content_en']; // افتراضيًا الإنجليزية
    }
}