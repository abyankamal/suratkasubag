<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Get query parameters
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Query users with relationships
        $usersQuery = User::with(['department', 'position'])
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('role', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc');

        // Paginate the results
        $users = $usersQuery->paginate($perPage)->withQueryString();

        // Transform the users for frontend display
        $users->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'displayRole' => ucfirst($user->role),
                'department_id' => $user->department_id,
                'position_id' => $user->position_id,
                'department' => $user->department ? $user->department->name : null,
                'position' => $user->position ? $user->position->name : null,
                'avatar' => null, // Placeholder for avatar if implemented later
            ];
        });

        // Get departments and positions for the form
        $departments = Department::all(['id', 'name']);
        $positions = Position::all(['id', 'name']);

        // Return Inertia view with data
        return Inertia::render('Users/index', [
            'users' => $users,
            'departments' => $departments,
            'positions' => $positions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Get the department ID from either field name
        $departmentId = $request->department_id ?? $request->departement_id;
        $request->merge(['department_id' => $departmentId]);
        
        // Validate request data
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'in:admin,user'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:positions,id'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi',
            'name.string' => 'Nama harus berupa teks',
            'name.max' => 'Nama maksimal 255 karakter',
            'username.required' => 'Username wajib diisi',
            'username.string' => 'Username harus berupa teks',
            'username.max' => 'Username maksimal 255 karakter',
            'username.unique' => 'Username sudah digunakan. Silakan gunakan username lain',
            'password.required' => 'Password wajib diisi',
            'password.string' => 'Password harus berupa teks',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'role.required' => 'Role wajib dipilih',
            'role.string' => 'Role harus berupa teks',
            'role.in' => 'Role harus admin atau user',
            'department_id.required' => 'Departemen wajib dipilih',
            'department_id.exists' => 'Departemen tidak valid',
            'position_id.required' => 'Jabatan wajib dipilih',
            'position_id.exists' => 'Jabatan tidak valid',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Create new user
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'department_id' => $request->department_id ?? $request->departement_id, // Handle both spellings
            'position_id' => $request->position_id,
        ]);

        // Return success response
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Get the department ID from either field name
        $departmentId = $request->department_id ?? $request->departement_id;
        $request->merge(['department_id' => $departmentId]);

        // Prepare validation rules
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', 'in:admin,user'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:positions,id'],
        ];

        // Add password validation if provided
        if ($request->filled('password')) {
            $rules['password'] = ['string', 'min:8', 'confirmed'];
        }

        // Validate request data
        $validator = Validator::make($request->all(), $rules, [
            'name.required' => 'Nama lengkap wajib diisi',
            'name.string' => 'Nama harus berupa teks',
            'name.max' => 'Nama maksimal 255 karakter',
            'username.required' => 'Username wajib diisi',
            'username.string' => 'Username harus berupa teks',
            'username.max' => 'Username maksimal 255 karakter',
            'username.unique' => 'Username sudah digunakan. Silakan gunakan username lain',
            'password.string' => 'Password harus berupa teks',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'role.required' => 'Role wajib dipilih',
            'role.string' => 'Role harus berupa teks',
            'role.in' => 'Role harus admin atau user',
            'department_id.required' => 'Departemen wajib dipilih',
            'department_id.exists' => 'Departemen tidak valid',
            'position_id.required' => 'Jabatan wajib dipilih',
            'position_id.exists' => 'Jabatan tidak valid',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Update user data
        $userData = [
            'name' => $request->name,
            'username' => $request->username,
            'role' => $request->role,
            'department_id' => $request->department_id ?? $request->departement_id, // Handle both spellings
            'position_id' => $request->position_id,
        ];

        // Update password if provided
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // Return success response
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting self
        if (auth()->id() === $user->id) {
            return redirect()->route('users.index')->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan.');
        }

        $user->delete();

        // Return success response
        return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
