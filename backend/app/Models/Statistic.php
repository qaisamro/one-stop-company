<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Statistic extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'label',
        'value',
        'icon',
        'language',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'statistics';
}