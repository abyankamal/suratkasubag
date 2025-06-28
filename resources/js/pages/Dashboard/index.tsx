import { FC } from 'react';
import { Head } from '@inertiajs/react';
import { FileText, Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

interface ReportItem {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | string;
  date: string;
  department: string;
  user: string;
}

interface DashboardProps {
  data: {
    stats: {
      totalReports: number;
      totalUsers?: number; // Optional as it's only for admin
      currentMonthReports: number;
      reportsChangePercent: number;
      usersChangePercent?: number; // Optional as it's only for admin
      completionRate: number;
      completionChange: number;
      isAdmin: boolean; // Flag to determine which mode to display
    };
    recentReports: ReportItem[];
    isEmpty: boolean;
  };
  auth: {
    user: {
      id: number;
      name: string;
      username: string;
      email: string;
      role: 'admin' | 'user';
      avatar?: string;
    } | null;
  };
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  changeType = 'neutral' 
}) => {
  const changeColor = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  const changePrefix = changeType === 'increase' ? '+' : '';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${changeColor}`}>
              {changePrefix}{change}% {changeType !== 'neutral' ? 'dari bulan lalu' : ''}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: FC<DashboardProps> = ({ data, auth }) => {
  // Safely extract data with proper defaults for TypeScript
  const { 
    stats = {
      totalReports: 0,
      totalUsers: 0,
      currentMonthReports: 0,
      reportsChangePercent: 0,
      usersChangePercent: 0,
      completionRate: 0,
      completionChange: 0,
      isAdmin: false // Default value for isAdmin
    }, 
    recentReports = [], 
    isEmpty = true 
  } = data || {};
  
  // Ensure recentReports is always an array
  const processedReports = Array.isArray(recentReports) ? recentReports : [];
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create stats data based on user role
  const statsData = [
    {
      title: 'Total Laporan',
      value: stats?.totalReports ?? 0,
      change: stats?.reportsChangePercent ?? 0,
      changeType: (stats?.reportsChangePercent ?? 0) >= 0 ? 'increase' as const : 'decrease' as const,
      icon: <FileText className="h-5 w-5" />
    },
    // Only show Total User for admin
    ...(stats?.isAdmin ? [
      {
        title: 'Total User',
        value: stats?.totalUsers ?? 0,
        change: stats?.usersChangePercent ?? 0,
        changeType: (stats?.usersChangePercent ?? 0) >= 0 ? 'increase' as const : 'decrease' as const,
        icon: <Users className="h-5 w-5" />
      }
    ] : []),
    {
      title: stats?.isAdmin ? 'Laporan Bulan Ini' : 'Laporan Anda Bulan Ini',
      value: stats?.currentMonthReports ?? 0,
      change: 3, // Fixed percentage for current month
      changeType: 'increase' as const,
      icon: <Calendar className="h-5 w-5" />
    },
  ];

  return (
    <AppLayout 
      auth={{ user: auth.user }} 
      header="Dashboard"
    >
      <Head title="Dashboard" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang di SIBULAN</h1>
          <p className="text-gray-500">Sistem Informasi Laporan Bulanan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.map((stat, index) => (
            <div key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Laporan Terbaru</h2>
            <p className="text-sm text-gray-500">Daftar laporan yang baru diunggah</p>
          </div>
          <div className="overflow-x-auto">
            {processedReports.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departemen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengunggah
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {report.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.user}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Belum ada laporan
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
