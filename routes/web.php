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

// Dashboard
Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Reports
Route::resource('reports', ReportController::class);
Route::get('reports/{id}/download', [ReportController::class, 'download'])->name('reports.download');
Route::get('my-reports', [ReportController::class, 'myReports'])->name('my-reports');

// Users
Route::resource('users', UserController::class)->except(['create', 'edit']);

// Departments
Route::resource('departments', DepartmentController::class);

// Positions
Route::resource('positions', PositionController::class);

// Profile
Route::prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'show'])->name('profile');
    Route::post('/change-password', [ProfileController::class, 'changePassword'])->name('profile.password.update');
    Route::post('/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
});
