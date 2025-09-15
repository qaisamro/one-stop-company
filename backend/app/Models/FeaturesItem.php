<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeaturesItem extends Model
{
    use HasFactory;

    protected $table = 'features_items';

    protected $fillable = [
        'section_id',
        'text', // Only 'text' column exists for content in features_items
        'icon',
        'tab_index',
    ];

    /**
     * Get the text for the feature item.
     * This simply returns the value of the 'text' column.
     * The language is implicitly tied to the section_id.
     */
    public function getTextAttribute()
    {
        return $this->attributes['text'];
    }

    /**
     * Get the section that owns the feature item.
     */
    public function section()
    {
        return $this->belongsTo(FeaturesSection::class, 'section_id', 'id');
    }
}