import { FC } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FileText, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  meta?: string;
}

interface ReportItem {
  id: number;
  title: string;
  status: string;
  date: string;
  department: string;
  user: string;
}

interface DashboardProps {
  data: {
    stats: {
      totalReports: number;
      totalUsers?: number;
      currentMonthReports: number;
      reportsChangePercent: number;
      usersChangePercent?: number;
      completionRate: number;
      completionChange: number;
      isAdmin: boolean;
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

const StatCard: FC<StatCardProps> = ({ title, value, change, meta }) => {
  const hasChange = change !== undefined;
  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;

  return (
    <div className="surface-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {hasChange ? (
          <span
            className={
              isPositive
                ? 'inline-flex items-center gap-1 font-medium text-success tabular-nums'
                : isNegative
                  ? 'inline-flex items-center gap-1 font-medium text-destructive tabular-nums'
                  : 'text-muted-foreground tabular-nums'
            }
          >
            {isPositive && <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {isNegative && <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {isPositive ? `+${change}%` : `${change}%`} vs bulan lalu
          </span>
        ) : (
          <span className="text-muted-foreground">{meta}</span>
        )}
      </div>
    </div>
  );
};

const Dashboard: FC<DashboardProps> = ({ data, auth }) => {
  const {
    stats = {
      totalReports: 0,
      totalUsers: 0,
      currentMonthReports: 0,
      reportsChangePercent: 0,
      usersChangePercent: 0,
      completionRate: 0,
      completionChange: 0,
      isAdmin: false,
    },
    recentReports = [],
  } = data || {};

  const processedReports = Array.isArray(recentReports) ? recentReports : [];

  const currentPeriod = new Date().toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <AppLayout auth={{ user: auth.user }} header="Beranda">
      <Head title="Beranda" />

      <div className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Ringkasan Laporan
            </h2>
            <p className="text-sm text-muted-foreground">
              Periode {currentPeriod}
            </p>
          </div>
          <Link
            href={route('reports.index')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <span>Lihat semua laporan</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Stat cards */}
        <div
          className={
            stats.isAdmin
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-3'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2'
          }
        >
          <StatCard
            title="Total Laporan"
            value={stats.totalReports ?? 0}
            change={stats.reportsChangePercent ?? 0}
          />
          {stats.isAdmin && (
            <StatCard
              title="Total Pengguna"
              value={stats.totalUsers ?? 0}
              change={stats.usersChangePercent ?? 0}
            />
          )}
          <StatCard
            title={stats.isAdmin ? 'Laporan Bulan Ini' : 'Laporan Anda Bulan Ini'}
            value={stats.currentMonthReports ?? 0}
            meta={`Periode ${currentPeriod}`}
          />
        </div>

        {/* Recent reports */}
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Laporan Terbaru
              </h3>
              <p className="text-xs text-muted-foreground">
                5 dokumen laporan yang terakhir diunggah
              </p>
            </div>
          </div>

          {processedReports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Pengunggah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <FileText
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          strokeWidth={1.5}
                        />
                        <span className="truncate max-w-[260px] sm:max-w-none">
                          {report.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatDate(report.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.department}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.user}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Belum ada laporan
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Laporan yang diunggah akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
