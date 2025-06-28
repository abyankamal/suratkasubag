import { FC } from 'react';
import { Head } from '@inertiajs/react';
import { FileText, Users, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

interface ReportItem {
  id: number;
  name: string;
  date: string;
  uploader: string;
  type: string;
}

interface DashboardProps {
  data: {
    stats: Array<{
      name: string;
      value: string;
      change: string;
    }>;
    recentReports: ReportItem[];
    welcomeMessage: string;
    welcomeDescription: string;
    isEmpty: boolean;
    emptyMessage: string;
  };
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      level: 'admin' | 'user';
    } | null;
  };
}

const StatCard: FC<StatCardProps> = ({ title, value, change, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-green-600 mt-1">{change}</p>
      </div>
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: FC<DashboardProps> = ({ data, auth }) => {
  const stats = data.stats || [];
  const recentReports = data.recentReports || [];
  const welcomeMessage = data.welcomeMessage || 'Selamat Datang';
  const welcomeDescription = data.welcomeDescription || 'Sistem Informasi Laporan';
  const isEmpty = data.isEmpty || false;
  const emptyMessage = data.emptyMessage || 'Tidak ada data yang tersedia';

  const statsData = [
    {
      title: 'Total Laporan',
      value: stats[0]?.value || '0',
      change: stats[0]?.change || '+0% dari bulan lalu',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Total User',
      value: stats[1]?.value || '0',
      change: stats[1]?.change || '+0% dari bulan lalu',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Laporan Bulan Ini',
      value: stats[2]?.value || '0',
      change: stats[2]?.change || '+0% dari bulan lalu',
      icon: <Calendar className="h-5 w-5" />
    }
  ];

  return (
    <AppLayout auth={{ user: auth.user }}>
      <Head title="Dashboard" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
          <p className="text-gray-500">{welcomeDescription}</p>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsData.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Laporan Terbaru</h2>
                <p className="text-sm text-gray-500">Daftar laporan yang baru diunggah</p>
              </div>
              <div className="overflow-x-auto">
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
                        Diunggah Oleh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReports.map((report: ReportItem) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {report.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.uploader}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {report.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
