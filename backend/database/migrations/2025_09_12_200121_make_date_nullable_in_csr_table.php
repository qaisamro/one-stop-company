<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('csr', function (Blueprint $table) {
            $table->date('date')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('csr', function (Blueprint $table) {
            $table->date('date')->nullable(false)->change();
        });
    }
};
