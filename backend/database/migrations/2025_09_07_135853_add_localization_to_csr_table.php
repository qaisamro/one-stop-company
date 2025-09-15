<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLocalizationToCsrTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('csr', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->string('title_en')->nullable()->after('title_ar');
            $table->text('paragraph_ar')->after('paragraph');
            $table->text('paragraph_en')->after('paragraph_ar');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('csr', function (Blueprint $table) {
            $table->dropColumn(['title_ar', 'title_en', 'paragraph_ar', 'paragraph_en']);
        });
    }
}
