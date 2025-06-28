<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            $request->authenticate();
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard', absolute: false));
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            $indonesianMessages = [];
            
            foreach ($errors as $field => $messages) {
                foreach ($messages as $message) {
                    if ($field === 'username' || $field === 'email') {
                        if (str_contains($message, 'required')) {
                            $indonesianMessages[$field] = 'Username harus diisi';
                        } else {
                            $indonesianMessages[$field] = 'Username atau password salah';
                        }
                    } elseif ($field === 'password') {
                        if (str_contains($message, 'required')) {
                            $indonesianMessages[$field] = 'Password harus diisi';
                        } else {
                            $indonesianMessages[$field] = 'Username atau password salah';
                        }
                    } else {
                        $indonesianMessages[$field] = 'Terjadi kesalahan. Silakan coba lagi.';
                    }
                }
            }
            
            throw \Illuminate\Validation\ValidationException::withMessages($indonesianMessages);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
