<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeaturesSection extends Model
{
    use HasFactory;

    protected $table = 'features_sections';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'subtitle',
        'description',
        'tab1_title',
        'tab2_title',
        'tab3_title',
        'tab4_title',
        'button_text',
        'button_url',
        'image_url', // تأكد أن هذا موجود للسماح بحفظ مسار الصورة
        'language',
    ];

    /**
     * Get the items for the features section.
     */
    public function items()
    {
        return $this->hasMany(FeaturesItem::class, 'section_id', 'id');
    }
}