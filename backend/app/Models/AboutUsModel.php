<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutUsModel extends Model
{
    use HasFactory;

    protected $table = 'about_us';

    protected $fillable = [
        'language',
        'title_small',
        'title_main',
        'description',
        'image_url',
        'experience_year',
        'experience_text',
        'button_text',
        'button_url',
    ];

    public function blocks()
    {
        return $this->hasMany(AboutBlockModel::class, 'about_id');
    }

    public function features()
    {
        return $this->hasMany(AboutFeatureModel::class, 'about_id');
    }
}

class AboutBlockModel extends Model
{
    use HasFactory;

    protected $table = 'about_blocks';

    protected $fillable = [
        'about_id',
        'language',
        'block_title',
        'block_description',
        'order_index',
    ];

    public function aboutUs()
    {
        return $this->belongsTo(AboutUsModel::class, 'about_id');
    }
}

class AboutFeatureModel extends Model
{
    use HasFactory;

    protected $table = 'about_features';

    protected $fillable = [
        'about_id',
        'language',
        'title',
        'description',
        'order_index',
    ];

    public function aboutUs()
    {
        return $this->belongsTo(AboutUsModel::class, 'about_id');
    }
}