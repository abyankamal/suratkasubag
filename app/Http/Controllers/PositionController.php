<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PositionController extends Controller
{
    /**
     * Display a listing of the positions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Position::query();
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }
        
        $positions = $query->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();
        
        return Inertia::render('Positions/index', [
            'positions' => $positions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Positions/Form', [
            'isEdit' => false,
            'position' => null
        ]);
    }

    /**
     * Store a newly created position in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:positions,name',
        ], [
            'name.required' => 'Nama posisi wajib diisi',
            'name.string' => 'Nama posisi harus berupa teks',
            'name.max' => 'Nama posisi maksimal 255 karakter',
            'name.unique' => 'Nama posisi sudah digunakan. Silakan gunakan nama lain.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Position::create([
            'name' => $request->name,
        ]);

        return redirect()->route('positions.index')->with('success', 'Posisi berhasil ditambahkan');
    }

     /**
     * Show the form for editing the specified resource.
     */
    public function edit(Position $position)
    {
        return Inertia::render('Positions/Form', [
            'isEdit' => true,
            'position' => $position->only(['id', 'name', 'created_at', 'updated_at'])
        ]);
    }

    /**
     * Update the specified position in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Position  $position
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Position $position)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
        ], [
            'name.required' => 'Nama posisi wajib diisi',
            'name.string' => 'Nama posisi harus berupa teks',
            'name.max' => 'Nama posisi maksimal 255 karakter',
            'name.unique' => 'Nama posisi sudah digunakan. Silakan gunakan nama lain.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $position->update([
            'name' => $request->name,
        ]);

        return redirect()->route('positions.index')->with('success', 'Posisi berhasil diperbarui');
    }

    /**
     * Remove the specified position from storage.
     *
     * @param  \App\Models\Position  $position
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Position $position)
    {
        // Check if position has associated users
        if ($position->users()->count() > 0) {
            return back()->withErrors(['delete' => 'Tidak dapat menghapus posisi yang masih digunakan oleh pengguna.']);
        }

        $position->delete();

        return redirect()->route('positions.index')->with('success', 'Posisi berhasil dihapus');
    }
}
