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
    
    // Routes for both admin and user roles
    Route::get('reports/{id}/download', [ReportController::class, 'download'])->name('reports.download');
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        // Users management
        Route::resource('users', UserController::class)->except(['create', 'edit']);
        
        // Departments management
        Route::resource('departments', DepartmentController::class);
        
        // Positions management
        Route::resource('positions', PositionController::class);
        
        // Admin reports access
        Route::resource('reports', ReportController::class);
    });
    
    // User-only routes
    Route::middleware(['role:user'])->group(function () {
        // User can only see their own reports
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/create', [ReportController::class, 'create'])->name('reports.create');
        Route::post('reports', [ReportController::class, 'store'])->name('reports.store');
        Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
        Route::get('reports/{report}/edit', [ReportController::class, 'edit'])->name('reports.edit');
        Route::put('reports/{report}', [ReportController::class, 'update'])->name('reports.update');
        Route::delete('reports/{report}', [ReportController::class, 'destroy'])->name('reports.destroy');
    });
});
