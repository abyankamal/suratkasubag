<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Department::query();

        // Apply search filter if search term exists
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('name', 'like', $searchTerm);
        }

        // Get paginated results with 10 items per page by default
        $perPage = $request->per_page ?? 10;
        $departments = $query->latest()->paginate($perPage);


        return Inertia::render('Departments/index', [
            'departments' => [
                'data' => $departments->items(),
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => (int) $perPage,
                'total' => $departments->total(),
                'from' => $departments->firstItem(),
                'to' => $departments->lastItem(),
                'filters' => [
                    'search' => $request->search ?? '',
                ]
            ],
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Departments/Form', [
            'isEdit' => false,
            'department' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ], [
            'name.required' => 'Nama departemen wajib diisi',
            'name.string' => 'Nama departemen harus berupa teks',
            'name.max' => 'Nama departemen maksimal 255 karakter',
            'name.unique' => 'Nama departemen sudah digunakan. Silakan gunakan nama lain.',
        ]);

        try {
            $department = Department::create($validated);
            
            return redirect()->route('departments.index')
                ->with('success', 'Departemen berhasil ditambahkan');
                
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Gagal menambahkan departemen. ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        return Inertia::render('Departments/Show', [
            'department' => $department->load('users'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Department $department)
    {
        return Inertia::render('Departments/Form', [
            'isEdit' => true,
            'department' => $department->only(['id', 'name', 'created_at', 'updated_at'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
        ], [
            'name.required' => 'Nama departemen wajib diisi',
            'name.string' => 'Nama departemen harus berupa teks',
            'name.max' => 'Nama departemen maksimal 255 karakter',
            'name.unique' => 'Nama departemen sudah digunakan. Silakan gunakan nama lain.',
        ]);

        try {
            $department->update($validated);
            
            return redirect()->route('departments.index')
                ->with('success', 'Departemen berhasil diperbarui');
                
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Gagal memperbarui departemen. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified department from storage.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Department $department)
    {
        try {
            if ($department->users()->exists()) {
                return back()->with('error', 'Tidak dapat menghapus departemen yang memiliki pengguna terkait.');
            }

            $department->delete();

            return redirect()->route('departments.index')
                ->with('success', 'Departemen berhasil dihapus');
                
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus departemen. Silakan coba lagi.');
        }
    }
}
