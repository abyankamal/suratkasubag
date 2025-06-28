<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics and recent reports.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get current user
        $user = Auth::user();
        $isAdmin = $user && $user->role === 'admin';
        
        // Get current month and previous month for comparisons
        $now = Carbon::now();
        $currentMonth = $now->format('Y-m');
        $previousMonth = $now->copy()->subMonth()->format('Y-m');
        
        // Initialize stats
        $stats = [
            'totalReports' => 0,
            'currentMonthReports' => 0,
            'reportsChangePercent' => 0,
            'completionRate' => 0,
            'completionChange' => 0,
            'isAdmin' => $isAdmin,
        ];
        
        // Calculate total reports
        if ($isAdmin) {
            $stats['totalReports'] = Report::count();
            
            // Calculate total users (admin only)
            $currentUserCount = User::count();
            $previousUserCount = User::where('created_at', '<', $now->copy()->startOfMonth())->count();
            $stats['totalUsers'] = $currentUserCount;
            
            // Calculate user change percentage
            $stats['usersChangePercent'] = $previousUserCount > 0 
                ? round((($currentUserCount - $previousUserCount) / $previousUserCount) * 100) 
                : 0;
            
            // Current month reports (all users)
            $stats['currentMonthReports'] = Report::whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count();
                
            // Previous month reports (all users)
            $previousMonthReports = Report::whereYear('created_at', $now->copy()->subMonth()->year)
                ->whereMonth('created_at', $now->copy()->subMonth()->month)
                ->count();
        } else {
            // For regular users, only show their own reports
            $stats['totalReports'] = Report::where('user_id', $user->id)->count();
            
            // Current month reports (current user only)
            $stats['currentMonthReports'] = Report::where('user_id', $user->id)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count();
                
            // Previous month reports (current user only)
            $previousMonthReports = Report::where('user_id', $user->id)
                ->whereYear('created_at', $now->copy()->subMonth()->year)
                ->whereMonth('created_at', $now->copy()->subMonth()->month)
                ->count();
        }
        
        // Calculate reports change percentage
        $stats['reportsChangePercent'] = $previousMonthReports > 0 
            ? round((($stats['currentMonthReports'] - $previousMonthReports) / $previousMonthReports) * 100) 
            : 0;
        
        // Get recent reports with user and department information
        $recentReportsQuery = Report::query()
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
            ->select(
                'reports.id',
                'reports.filename as title',
                'reports.created_at as date',
                DB::raw('COALESCE(departments.name, "Umum") as department'),
                'users.name as user'
            )
            ->orderBy('reports.created_at', 'desc')
            ->limit(5);
            
        // Filter by user if not admin
        if (!$isAdmin) {
            $recentReportsQuery->where('reports.user_id', $user->id);
        }
        
        $recentReports = $recentReportsQuery->get()->map(function ($report) {
            return [
                'id' => $report->id,
                'title' => $report->title,
                'status' => 'completed', // Assuming all reports are completed
                'date' => $report->date,
                'department' => $report->department,
                'user' => $report->user
            ];
        });
        
        // Check if there are any reports
        $isEmpty = $recentReports->isEmpty();
        
        // Prepare data for the dashboard
        $data = [
            'stats' => $stats,
            'recentReports' => $recentReports,
            'isEmpty' => $isEmpty
        ];
        
        // Render the dashboard view with data
        return Inertia::render('Dashboard/index', [
            'data' => $data,
        ]);
    }
}
