<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $table = 'team';

    protected $fillable = ['name', 'position', 'photo', 'language'];

    public function socials()
    {
        return $this->hasMany(TeamSocial::class);
    }

    public function getPhotoUrlAttribute()
    {
        // Return the full URL if photo exists, otherwise null
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}