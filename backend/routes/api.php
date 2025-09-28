<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CompanyIntroController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FeaturesController;
use App\Http\Controllers\HeaderLinkController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CSRController; // تم إضافة هذا السطر
use App\Http\Controllers\GalleryController; // تأكد من أن المسار صحيح


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// مسارات عامة (يمكن الوصول إليها دون مصادقة)
Route::group(['middleware' => 'api'], function () {


    Route::get('/gallery', [GalleryController::class, 'index']);
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);


    // مسارات CSR العامة

    // مسارات قسم "حول الشركة" (About)
    Route::get('/about', [AboutController::class, 'getAbout']);
    Route::get('/about/details', [AboutController::class, 'getAboutDetails']);

    // مسارات المدونات (Blogs) العامة
    Route::get('/blogs', [BlogController::class, 'index']);
    Route::get('/blogs/{id}', [BlogController::class, 'show']);

    // مسارات الشهادات (Certificates) العامة
    Route::get('/certificates', [CertificateController::class, 'index']);

    // مسارات مقدمة الشركة (Company Intro) العامة
    Route::get('/company-intro', [CompanyIntroController::class, 'index']);

    // مسارات التواصل (Contacts) العامة
    Route::post('/contacts', [ContactController::class, 'store']);

    // مسارات الميزات (Features) العامة
    Route::get('/features', [FeaturesController::class, 'index']);

    // مسارات روابط الرأس (Header Links) العامة
    Route::get('/header-links', [HeaderLinkController::class, 'index']);

    // مسارات المشاريع (Projects) العامة
    Route::get('/projects/background', [ProjectController::class, 'getProjectBackground']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);

    // مسارات الخدمات (Services) العامة
    Route::get('/services', [ServiceController::class, 'index']);

    // مسارات الإحصائيات (Statistics) العامة
    Route::get('/statistics', [StatisticController::class, 'index']);

    // مسارات الإعدادات (Settings) العامة
    Route::get('/settings/{key}', [SettingController::class, 'show']);

    // مسارات القصة (Story) العامة
    Route::get('/story', [StoryController::class, 'show']);

    // مسارات فريق العمل (Team) العامة
    Route::get('/team', [TeamController::class, 'index']);
});

// مسارات لوحة التحكم (Admin Authentication)
Route::prefix('admin')->group(function () {
    Route::post('/register', [AdminController::class, 'register']);
    Route::post('/login', [AdminController::class, 'login']);
});


Route::get('/csr/fixed-paragraph', [CSRController::class, 'getFixedParagraph']);
Route::post('/csr/fixed-paragraph', [CSRController::class, 'saveFixedParagraph']);


// مسارات لوحة التحكم المحمية (تتطلب مصادقة Sanctum)
    // مسارات CSR المحمية
 // CSR Routes
// Route to get all CSR items
Route::get('/csr', [CSRController::class, 'index']);

// Route to get a single CSR item (if needed, though index with editing covers this)
Route::get('/csr/{id}', [CSRController::class, 'show']);

// Route to store a NEW CSR item (POST to create)
Route::post('/csr', [CSRController::class, 'store']); // New method for creation

// Route to update an EXISTING CSR item (PUT/PATCH to update)
Route::put('/csr/{id}', [CSRController::class, 'update']); // New method for update
Route::patch('/csr/{id}', [CSRController::class, 'update']);

// Route to delete an entire CSR item
Route::delete('/csr/{id}', [CSRController::class, 'destroy']); // New method for deletion

// Route for image deletion (this remains similar, but needs to be tied to the correct CSR item ID)
Route::delete('/csr/image/{csrId}', [CSRController::class, 'deleteImage']);


    // مسارات المستخدم
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // مسارات تسجيل الخروج
    Route::post('/admin/logout', [AdminController::class, 'logout']);

    // مسارات قسم "حول الشركة" (About)
    Route::put('/about', [AboutController::class, 'updateAbout']);

    // مسارات المدونات (Blogs) المحمية
    Route::prefix('blogs')->group(function () {
        Route::post('/', [BlogController::class, 'store']);
        Route::put('/{id}', [BlogController::class, 'update'])->name('blogs.update');
        Route::delete('/{id}', [BlogController::class, 'destroy']);
    });

    // مسارات الشهادات (Certificates) المحمية
    Route::prefix('certificates')->group(function () {
        Route::post('/', [CertificateController::class, 'store']);
        Route::put('/{id}', [CertificateController::class, 'update']);
        Route::delete('/{id}', [CertificateController::class, 'destroy']);
    });

    // مسارات مقدمة الشركة (Company Intro) المحمية
    Route::prefix('company-intro')->group(function () {
        Route::post('/content', [CompanyIntroController::class, 'updateContent']);
        Route::post('/image', [CompanyIntroController::class, 'addImage']);
        Route::delete('/image/{index}', [CompanyIntroController::class, 'deleteImage']);
    });

    // مسارات التواصل (Contacts) المحمية
    Route::get('/contacts', [ContactController::class, 'index']);

    // مسارات الميزات (Features) المحمية
    Route::post('/features', [FeaturesController::class, 'storeSection']);
    Route::put('/features/{id}', [FeaturesController::class, 'updateSection']);
    Route::delete('/features/{id}', [FeaturesController::class, 'destroySection']);
    Route::post('/features/{section_id}/item', [FeaturesController::class, 'storeItem']);
    Route::delete('/features/item/{id}', [FeaturesController::class, 'destroyItem']);

    // مسارات روابط الرأس (Header Links) المحمية
    Route::prefix('header-links')->group(function () {
        Route::post('/', [HeaderLinkController::class, 'store']);
        Route::put('/{id}', [HeaderLinkController::class, 'update']);
        Route::delete('/{id}', [HeaderLinkController::class, 'destroy']);
    });

    // مسارات المشاريع (Projects) المحمية
    Route::post('/projects/background', [ProjectController::class, 'updateProjectBackground']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // مسارات الخدمات (Services) المحمية
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // مسارات الإحصائيات (Statistics) المحمية
    // جميع مسارات الإحصائيات (GET, POST, PUT, DELETE) يجب أن تكون هنا
    Route::get('/statistics', [StatisticController::class, 'index']);
    Route::post('/statistics', [StatisticController::class, 'store']);
    Route::put('/statistics/{id}', [StatisticController::class, 'update']);
    Route::delete('/statistics/{id}', [StatisticController::class, 'destroy']);

    // مسارات الإعدادات (Settings) المحمية
    Route::put('/settings/{key}', [SettingController::class, 'update']);

    // مسارات القصة (Story) المحمية
    Route::prefix('story')->group(function () {
        Route::post('/', [StoryController::class, 'store']);
        Route::put('/{id}', [StoryController::class, 'update']);
    });

    // مسارات فريق العمل (Team) المحمية
    Route::prefix('team')->group(function () {
        Route::post('/', [TeamController::class, 'store']);
        Route::put('/{id}', [TeamController::class, 'update']);
        Route::delete('/{id}', [TeamController::class, 'destroy']);
    });



