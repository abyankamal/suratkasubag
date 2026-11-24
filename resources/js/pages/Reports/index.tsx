import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Download, Trash2, Plus, Pencil, Eye, FileText } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Search from '@/components/Search';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import ReportForm, { Report as FormReport } from '@/pages/Reports/Form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Report = {
  id: number;
  name: string;
  date: string;
  uploader: string;
  filename?: string;
  stored_name?: string;
  path?: string;
  user_id?: number;
};

interface PageProps extends Record<string, any> {
  letters: {
    data: Report[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  auth: {
    user: {
      id: number;
      name: string;
      username: string;
      role: string;
    };
  };
}

export default function ReportsPage() {
  const { letters, auth, filters } = usePage<PageProps>().props || {};
  const isAdmin = auth?.user?.role === 'admin';

  const safeAuth = {
    ...auth,
    user: {
      id: auth?.user?.id || 0,
      name: auth?.user?.name || '',
      username: auth?.user?.username || '',
      role: (auth?.user?.role as 'admin' | 'user') || 'user',
    },
  };

  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
  const [dateTo, setDateTo] = useState(filters?.date_to || '');
  const [userFilter, setUserFilter] = useState(filters?.uploader || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedReport, setSelectedReport] = useState<FormReport | undefined>(undefined);

  const reports = letters?.data || [];
  const currentPage = letters?.current_page || 1;
  const totalItems = letters?.total || 0;
  const itemsPerPage = letters?.per_page || 10;
  const totalPages = letters?.last_page || 1;

  const uploaders = [...new Set(reports.map((report) => report.uploader))];

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMounted = useRef(false);

  const applyFilters = useCallback(
    (newFilters?: Record<string, any>) => {
      const params: Record<string, any> = {
        search: newFilters?.search !== undefined ? newFilters.search : searchInput,
        date_from: newFilters?.date_from !== undefined ? newFilters.date_from : dateFrom,
        date_to: newFilters?.date_to !== undefined ? newFilters.date_to : dateTo,
        uploader: newFilters?.uploader !== undefined ? newFilters.uploader : userFilter,
        page: newFilters?.page !== undefined ? newFilters.page : 1,
      };

      if (newFilters?.search !== undefined) setSearchInput(newFilters.search);
      if (newFilters?.date_from !== undefined) setDateFrom(newFilters.date_from);
      if (newFilters?.date_to !== undefined) setDateTo(newFilters.date_to);
      if (newFilters?.uploader !== undefined) setUserFilter(newFilters.uploader);

      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      router.get(route('reports.index'), params, {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      });
    },
    [searchInput, dateFrom, dateTo, userFilter]
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const handler = setTimeout(() => {
      applyFilters({ search: searchInput });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handlePageChange = (page: number) => {
    applyFilters({ page });
  };

  const handleDownload = (id: number) => {
    window.open(route('reports.download', id), '_blank');
  };

  const handleView = (id: number) => {
    window.open(route('reports.view', id), '_blank');
  };

  const handleDelete = (id: number) => {
    setReportToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reportToDelete === null) return;

    setIsDeleting(true);
    const loadingToast = toast.loading('Menghapus laporan...');

    router.delete(route('reports.destroy', reportToDelete), {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        toast.success('Laporan berhasil dihapus');
        setIsDeleteDialogOpen(false);
        setReportToDelete(null);
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        toast.error(`Gagal menghapus laporan: ${error?.message || 'Terjadi kesalahan'}`);
        setIsDeleteDialogOpen(false);
        setReportToDelete(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  };

  const handleFormSubmit = (formData: FormData) => {
    const selectedId = selectedReport?.id;

    if (formMode === 'create') {
      router.post(route('reports.store'), formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast.success('Laporan berhasil ditambahkan');
        },
        onError: () => {
          toast.error('Gagal menambahkan laporan');
        },
      });
    } else if (formMode === 'update' && selectedId) {
      router.post(route('reports.update', { id: selectedId }), formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast.success('Laporan berhasil diperbarui');
        },
        onError: () => {
          toast.error('Gagal memperbarui laporan');
        },
      });
    }
  };

  const handleEdit = (id: number) => {
    const reportToEdit = letters.data.find((report) => report.id === id);
    if (reportToEdit) {
      const report: FormReport = {
        id: reportToEdit.id,
        title: reportToEdit.name,
        filename: reportToEdit.filename || reportToEdit.stored_name || '',
        date: reportToEdit.date,
        uploader: reportToEdit.uploader,
        original_filename: reportToEdit.filename,
        file_path: reportToEdit.path,
        user_id: reportToEdit.user_id,
      };
      setSelectedReport(report);
      setFormMode('update');
      setIsFormOpen(true);
    }
  };

  const handleAddNew = () => {
    setFormMode('create');
    setSelectedReport(undefined);
    setIsFormOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const pageTitle = isAdmin ? 'Daftar Laporan' : 'Laporan Saya';
  const reportBeingDeleted = reports.find((r) => r.id === reportToDelete);

  return (
    <AppLayout auth={safeAuth} header={pageTitle}>
      <Head title={pageTitle} />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {pageTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola dan telusuri dokumen laporan bulanan
            </p>
          </div>
          {!isAdmin && (
            <Button onClick={handleAddNew} className="self-start sm:self-auto">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Tambah Laporan</span>
            </Button>
          )}
        </div>

        {/* Filter panel */}
        <div className="surface-card p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div className={isAdmin ? 'md:col-span-4' : 'md:col-span-6'}>
              <Label htmlFor="report-search" className="mb-1.5 block text-xs text-muted-foreground">
                Pencarian
              </Label>
              <Search
                placeholder="Cari laporan"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className={isAdmin ? 'md:col-span-2' : 'md:col-span-3'}>
              <Label htmlFor="date-from" className="mb-1.5 block text-xs text-muted-foreground">
                Dari tanggal
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => applyFilters({ date_from: e.target.value })}
              />
            </div>

            <div className={isAdmin ? 'md:col-span-2' : 'md:col-span-3'}>
              <Label htmlFor="date-to" className="mb-1.5 block text-xs text-muted-foreground">
                Sampai tanggal
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => applyFilters({ date_to: e.target.value })}
              />
            </div>

            {isAdmin && (
              <div className="md:col-span-4">
                <Label htmlFor="user-filter" className="mb-1.5 block text-xs text-muted-foreground">
                  Pengunggah
                </Label>
                <select
                  id="user-filter"
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  value={userFilter}
                  onChange={(e) => applyFilters({ uploader: e.target.value })}
                >
                  <option value="">Semua pengguna</option>
                  {uploaders.map((uploader) => (
                    <option key={uploader} value={uploader}>
                      {uploader}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Data container */}
        <div className="surface-card overflow-hidden">
          {reports.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">No</TableHead>
                      <TableHead>Nama Surat</TableHead>
                      <TableHead>Tanggal Upload</TableHead>
                      {isAdmin && <TableHead>Pengunggah</TableHead>}
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report, index) => {
                      const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {itemNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2.5">
                              <FileText
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                strokeWidth={1.5}
                              />
                              <span>{report.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                            {formatDate(report.date)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-muted-foreground">
                              {report.uploader}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(report.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Lihat"
                                aria-label={`Lihat ${report.name}`}
                              >
                                <Eye className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(report.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Unduh"
                                aria-label={`Unduh ${report.name}`}
                              >
                                <Download className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                              {!isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(report.id)}
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title="Edit"
                                  aria-label={`Edit ${report.name}`}
                                >
                                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(report.id)}
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Hapus"
                                aria-label={`Hapus ${report.name}`}
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="divide-y divide-border md:hidden">
                {reports.map((report, index) => {
                  const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <div key={report.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground tabular-nums">
                              #{itemNumber}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDate(report.date)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground break-words">
                            {report.name}
                          </p>
                          {isAdmin && (
                            <p className="text-xs text-muted-foreground">
                              Pengunggah: {report.uploader}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(report.id)}
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Lihat</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report.id)}
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Unduh</span>
                        </Button>
                        {!isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(report.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Tidak ada laporan ditemukan
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Coba ubah kata kunci pencarian atau rentang tanggal.
              </p>
            </div>
          )}

          {totalPages > 0 && totalItems > 0 && (
            <div className="border-t border-border px-4 py-3 sm:px-6">
              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <ReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        onSubmit={handleFormSubmit}
        selectedReport={selectedReport}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={() => setReportToDelete(null)}
        title="Hapus Laporan"
        description="Apakah Anda yakin ingin menghapus laporan"
        itemName={reportBeingDeleted?.name || ''}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
