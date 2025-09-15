<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamSocial extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'social_url',
        'platform',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}