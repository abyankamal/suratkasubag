<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Redirect;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
*/

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

// Authentication Routes
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

require __DIR__.'/auth.php';

// Protected routes for authenticated users
Route::middleware(['auth'])->group(function () {
    // Dashboard - accessible by all authenticated users
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile - accessible by all authenticated users
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('profile');
        Route::post('/change-password', [ProfileController::class, 'changePassword'])->name('profile.password.update');
        Route::post('/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    });
    
    // Reports routes - accessible by all authenticated users with authorization in controller
    Route::resource('reports', ReportController::class);
    Route::get('reports/{report}/download', [ReportController::class, 'download'])->name('reports.download');

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        // Users management
        Route::resource('users', UserController::class)->except(['create', 'edit']);

        // Departments management
        Route::resource('departments', DepartmentController::class);

        // Positions management
        Route::resource('positions', PositionController::class);
    });
});
