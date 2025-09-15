<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // 'id', // 'id' is typically auto-incrementing and handled by the database.
        'language',
        'title',
        'description',
        'icon',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'services';
}