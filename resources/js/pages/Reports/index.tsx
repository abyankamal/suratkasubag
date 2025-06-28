import { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Download, Trash2, Plus, Pencil, AlertTriangle } from "lucide-react";
import Search from "@/components/Search";
import ReportForm, { Report as FormReport } from "@/pages/Reports/Form";
import { Pagination } from "@/components/Pagination";
// Using react-hot-toast instead of sonner
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/AppLayout';

// Add dialog components for confirmation
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


// Define the API response Report type
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

// Define the PageProps type with Inertia's Page interface
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
    }
  };
}

export default function ReportsPage() {
  // Get page props from Inertia
  const { letters, auth, filters } = usePage<PageProps>().props || {};
  
  // State management with proper null checks
  const isAdmin = auth?.user?.role === 'admin';
  
  // Ensure auth.user exists with default values
  const safeAuth = {
    ...auth,
    user: {
      id: auth?.user?.id || 0,
      name: auth?.user?.name || '',
      username: auth?.user?.username || '',
      role: (auth?.user?.role as 'admin' | 'user') || 'user'
    }
  };
  
  // Initialize filter states from props or empty strings
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
  const [dateTo, setDateTo] = useState(filters?.date_to || '');
  const [userFilter, setUserFilter] = useState(filters?.uploader || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedReport, setSelectedReport] = useState<FormReport | undefined>(undefined);
  
  // Get the reports data from the paginated response
  const reports = letters?.data || [];
  const currentPage = letters?.current_page || 1;
  const totalItems = letters?.total || 0;
  const itemsPerPage = letters?.per_page || 10;
  const totalPages = letters?.last_page || 1;
  
  // Get unique uploaders for filter
  const uploaders = [...new Set(reports.map(report => report.uploader))];

  // State for storing the input value before filtering
  const [searchInputValue, setSearchInputValue] = useState(searchInput);
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  
  // Apply filtering only when user has finished typing (debounced)
  useEffect(() => {
    // Apply debouncing for better performance
    const handler = setTimeout(() => {
      // Update the actual search filter value after debounce
      if (searchInputValue !== searchInput) {
        applyFilters({ search: searchInputValue });
      }
    }, 500); // Increased debounce time for better user experience
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  // Function to apply filters and reload data from server
  const applyFilters = useCallback((newFilters?: Record<string, any>) => {
    const params: Record<string, any> = {
      search: newFilters?.search !== undefined ? newFilters.search : searchInput,
      date_from: newFilters?.date_from !== undefined ? newFilters.date_from : dateFrom,
      date_to: newFilters?.date_to !== undefined ? newFilters.date_to : dateTo,
      uploader: newFilters?.uploader !== undefined ? newFilters.uploader : userFilter,
      page: newFilters?.page !== undefined ? newFilters.page : 1,
    };
    
    // Update state if new filters are provided
    if (newFilters?.search !== undefined) setSearchInput(newFilters.search);
    if (newFilters?.date_from !== undefined) setDateFrom(newFilters.date_from);
    if (newFilters?.date_to !== undefined) setDateTo(newFilters.date_to);
    if (newFilters?.uploader !== undefined) setUserFilter(newFilters.uploader);
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === null || params[k] === undefined) {
        delete params[k];
      }
    });
    
    router.get(route('reports.index'), params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  }, [searchInput, dateFrom, dateTo, userFilter]);
  
  // Pagination
  const ITEMS_PER_PAGE = itemsPerPage;

  // Handle page change
  const handlePageChange = (page: number) => {
    applyFilters({ page });
  };

  const handleDownload = (id: number) => {
    window.open(route('reports.download', id), '_blank');
  };

  // Function to open delete confirmation dialog
  const handleDelete = (id: number) => {
    // Find the report to show its name in the confirmation dialog
    const reportToRemove = reports.find(report => report.id === id);
    setReportToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to execute deletion after confirmation
  const confirmDelete = () => {
    if (reportToDelete === null) return;
    
    // Show loading toast
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
      }
    });
  };
  
  // Function to cancel deletion
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleFormSubmit = (formData: FormData) => {
    const selectedId = selectedReport?.id;
    
    if (formMode === 'create') {
      // Create new report
      router.post(route('reports.store'), formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast.success('Laporan berhasil ditambahkan');
        },
        onError: () => {
          toast.error('Gagal menambahkan laporan');
        }
      });
    } else if (formMode === 'update' && selectedId) {
      // Update existing report
      router.post(route('reports.update', { id: selectedId }), formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast.success('Laporan berhasil diperbarui');
        },
        onError: () => {
          toast.error('Gagal memperbarui laporan');
        }
      });
    }
  };

  const handleEdit = (id: number) => {
    const reportToEdit = letters.data.find(report => report.id === id);
    if (reportToEdit) {
      // Convert API Report to FormReport
      const report: FormReport = {
        id: reportToEdit.id,
        title: reportToEdit.name,  // Map name to title for Form.tsx compatibility
        filename: reportToEdit.filename || reportToEdit.stored_name || '',
        date: reportToEdit.date,
        uploader: reportToEdit.uploader,
        original_filename: reportToEdit.filename,
        file_path: reportToEdit.path,
        user_id: reportToEdit.user_id
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

  // Cast auth to the correct type for AppLayout
  const typedAuth = {
    user: {
      ...safeAuth.user,
      role: (safeAuth.user.role || 'user') as 'admin' | 'user'
    }
  };

  return (
    <AppLayout 
      auth={typedAuth} 
      header="Daftar Laporan"
    >
      <Head title="Daftar Laporan" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Daftar Laporan</h1>
          {!isAdmin && (
            <Button 
              variant="default" 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={handleAddNew}
            >
              <Plus className="h-4 w-4" />
              Tambah Surat
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Cari laporan..."
                initialValue={searchInputValue}
                onSearch={(value) => setSearchInputValue(value)}
                minChars={0}
                debounceTime={300}
                className="w-full"
                autoFocus={true}
              />
            </div>

            <div className="flex flex-1 flex-col md:flex-row gap-2">
              <div className="flex-1">
                <label
                  htmlFor="date-from"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Dari Tanggal
                </label>
                <input
                  id="date-from"
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={dateFrom}
                  onChange={(e) => applyFilters({ date_from: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="date-to"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Sampai Tanggal
                </label>
                <input
                  id="date-to"
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={dateTo}
                  onChange={(e) => applyFilters({ date_to: e.target.value })}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex-1">
                <label
                  htmlFor="user-filter"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Pengunggah
                </label>
                <select
                  id="user-filter"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={userFilter}
                  onChange={(e) => applyFilters({ uploader: e.target.value })}
                >
                  <option value="">Semua Pengguna</option>
                  {uploaders.map(uploader => (
                    <option key={uploader} value={uploader}>{uploader}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Surat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Upload
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengunggah
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length > 0 ? (
                  reports.map((report, index) => {
                    const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {itemNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(report.date).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.uploader}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDownload(report.id)}
                              className="border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {!isAdmin && (
                              <Button
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEdit(report.id)}
                                className="border-gray-200 hover:bg-yellow-50 hover:text-yellow-600"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDelete(report.id)}
                              className="border-gray-200 hover:bg-red-50 hover:text-red-600"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Client-side Pagination */}
          {totalPages > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <Pagination
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Konfirmasi Hapus Laporan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus laporan ini?
              {reportToDelete !== null && (
                <p className="mt-2 font-semibold">
                  {reports.find(report => report.id === reportToDelete)?.name}
                </p>
              )}
              <p className="mt-2 text-red-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
