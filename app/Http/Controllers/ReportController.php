<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Show the form for creating a new report.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Reports/Form', [
            'mode' => 'create',
            'report' => null
        ]);
    }

    /**
     * Show the form for editing the specified report.
     *
     * @param  int  $report
     * @return \Inertia\Response
     */
    public function edit($report)
    {
        $report = Report::findOrFail($report);
        
        // Check if user has permission to edit this report
        if (Auth::user()->role !== 'admin' && Auth::id() !== $report->user_id) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Reports/Form', [
            'mode' => 'edit',
            'report' => [
                'id' => $report->id,
                'title' => $report->filename,
                'filename' => $report->filename,
                'stored_name' => $report->stored_name,
                'path' => $report->path,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
            ]
        ]);
    }
    
    /**
     * Display a listing of the reports.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Report::query()
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->select('reports.*', 'users.name as uploader');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('reports.filename', 'like', '%' . $request->search . '%');
        }

        // Apply date range filters
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('reports.created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('reports.created_at', '<=', $request->date_to);
        }

        // Apply uploader filter (for admins)
        if ($request->has('uploader') && !empty($request->uploader)) {
            $query->where('users.name', $request->uploader);
        }

        // If user is not admin, only show their reports
        if (Auth::user()->role !== 'admin') {
            $query->where('reports.user_id', Auth::id());
        }

        // Get paginated results
        $reports = $query->latest('reports.created_at')->paginate(10)
            ->through(function ($report) {
                return [
                    'id' => $report->id,
                    'name' => $report->filename, // Use filename as name for display
                    'title' => $report->filename, // Also include title for Form.tsx compatibility
                    'date' => $report->created_at->format('Y-m-d H:i:s'),
                    'uploader' => $report->uploader,
                    'filename' => $report->filename,
                    'stored_name' => $report->stored_name,
                    'path' => $report->path,
                    'user_id' => $report->user_id,
                    'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $report->updated_at->format('Y-m-d H:i:s')
                ];
            });

        return Inertia::render('Reports/index', [
            'letters' => $reports,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'uploader']),
        ]);
    }

    /**
     * Display the specified report.
     *
     * @param  int  $report
     * @return \Inertia\Response
     */
    public function show($report)
    {
        $report = Report::findOrFail($report);

        // Check if user has permission to view this report
        if (Auth::user()->role !== 'admin' && Auth::id() !== $report->user_id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Reports/Show', [
            'report' => [
                'id' => $report->id,
                'title' => $report->filename,
                'filename' => $report->filename,
                'stored_name' => $report->stored_name,
                'path' => $report->path,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'user_id' => $report->user_id,
            ]
        ]);
    }

    /**
     * Store a newly created report in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'date' => 'nullable|date',
            'file' => 'required|file|max:10240|mimes:pdf', // 10MB limit, PDF only
        ], [
            'title.required' => 'Judul laporan wajib diisi',
            'title.max' => 'Judul laporan maksimal 255 karakter',
            'file.required' => 'File laporan wajib diunggah',
            'file.file' => 'File harus berupa file yang valid',
            'file.max' => 'Ukuran file maksimal 10MB',
            'file.mimes' => 'Format file harus PDF',
            'date.date' => 'Format tanggal tidak valid',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $storedName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Store the file
        $path = $file->storeAs('reports', $storedName, 'public');
        
        // Create report record with the title field mapped to filename
        $report = Report::create([
            'filename' => $request->title, // Map title to filename
            'stored_name' => $storedName,
            'path' => $path,
            'size' => $file->getSize(),
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil ditambahkan');
    }

    /**
     * Update the specified report in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $report
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $report)
    {
        // Support for PUT method emulation via _method field
        $report = Report::findOrFail($report);
        
        // Check if user has permission to update this report
        if (Auth::user()->role !== 'admin' && Auth::id() !== $report->user_id) {
            return back()->with('error', 'Anda tidak memiliki akses untuk mengubah laporan ini');
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'date' => 'nullable|date',
            'file' => 'nullable|file|max:10240|mimes:pdf', // 10MB limit, PDF only
        ], [
            'title.required' => 'Judul laporan wajib diisi',
            'title.max' => 'Judul laporan maksimal 255 karakter',
            'file.file' => 'File harus berupa file yang valid',
            'file.max' => 'Ukuran file maksimal 10MB',
            'file.mimes' => 'Format file harus PDF',
            'date.date' => 'Format tanggal tidak valid',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Update report data
        $report->filename = $request->title; // Map title to filename

        // If new file is uploaded
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // Delete old file
            if (Storage::disk('public')->exists($report->path)) {
                Storage::disk('public')->delete($report->path);
            }
            
            $originalFilename = $file->getClientOriginalName();
            $storedName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Store the new file
            $path = $file->storeAs('reports', $storedName, 'public');
            
            // Update file info
            $report->stored_name = $storedName;
            $report->path = $path;
            $report->size = $file->getSize();
        }
        
        $report->save();

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil diperbarui');
    }

    /**
     * Remove the specified report from storage.
     *
     * @param  int  $report
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($report)
    {
        $report = Report::findOrFail($report);
        
        // Check if user has permission to delete this report
        if (Auth::user()->role !== 'admin' && Auth::id() !== $report->user_id) {
            return back()->with('error', 'Anda tidak memiliki akses untuk menghapus laporan ini');
        }
        
        // Delete the actual file
        if (Storage::disk('public')->exists($report->path)) {
            Storage::disk('public')->delete($report->path);
        }
        
        // Delete the record
        $report->delete();

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dihapus');
    }

    /**
     * Download the specified report file.
     *
     * @param  int  $report
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function download($report)
    {
        $report = Report::findOrFail($report);
        
        $filePath = storage_path('app/public/' . $report->path);
        
        if (file_exists($filePath)) {
            // Add .pdf extension to downloaded file if it doesn't have one
            $downloadName = $report->filename;
            if (!str_ends_with(strtolower($downloadName), '.pdf')) {
                $downloadName .= '.pdf';
            }
            
            return response()->download($filePath, $downloadName);
        }
        
        return back()->with('error', 'File tidak ditemukan');
    }
}
