<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class ProfileController extends Controller
{
    private $avatarPath = 'public/uploads/avatars';
    private $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    private $maxFileSize = 5120; // 5MB in KB
    private $imageSize = 400;

    /**
     * Get current user profile
     */
    /**
     * Change the user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.current_password' => 'The current password is incorrect.',
            'new_password.confirmed' => 'The new password confirmation does not match.',
            'new_password.min' => 'The new password must be at least 8 characters.',
        ]);

        try {
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return back()->with([
                'success' => 'Password updated successfully.'
            ]);
            
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to update password. Please try again.'
            ]);
        }
    }

    /**
     * Get current user profile
     */
    public function show()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Return the Inertia view with user data
        return inertia('Profile/index', [
            'user' => [
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'department' => $user->department,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : '/images/avatar.png',
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'department' => 'nullable|string|max:255',
        ]);
        
        try {
            $user->update($validated);
            
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'department' => $user->department,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : '/images/avatar.png',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'new_password' => ['required', 'string', 'min:8', 'different:current_password'],
            'new_password_confirmation' => ['required', 'same:new_password'],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi',
            'current_password.current_password' => 'Password saat ini tidak sesuai',
            'new_password.required' => 'Password baru wajib diisi',
            'new_password.min' => 'Password baru minimal 8 karakter',
            'new_password.different' => 'Password baru harus berbeda dengan password saat ini',
            'new_password_confirmation.required' => 'Konfirmasi password wajib diisi',
            'new_password_confirmation.same' => 'Konfirmasi password tidak cocok dengan password baru',
        ]);

        try {
            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return back()->with('success', 'Password berhasil diperbarui');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Terjadi kesalahan. Gagal memperbarui password. Silakan coba lagi nanti.',
            ]);
        }
    }

    /**
     * Upload/update user avatar
     */
    public function updateAvatar(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:' . $this->maxFileSize,
        ]);

        try {
            // Create directory if it doesn't exist
            if (!Storage::exists($this->avatarPath)) {
                Storage::makeDirectory($this->avatarPath);
            }


            // Delete old avatar if it exists
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }

            // Generate new filename
            $extension = $request->file('avatar')->extension();
            $fileName = $user->id . '-' . now()->timestamp . '.webp';
            $path = $this->avatarPath . '/' . $fileName;

            // Process and save the image
            $image = Image::make($request->file('avatar'))
                ->fit($this->imageSize, $this->imageSize, function ($constraint) {
                    $constraint->upsize();
                })
                ->encode('webp', 80);

            Storage::put($path, $image);

            // Update user's avatar path
            $user->update([
                'avatar' => $path
            ]);

            return response()->json([
                'message' => 'Avatar updated successfully',
                'avatar' => Storage::url($path),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
