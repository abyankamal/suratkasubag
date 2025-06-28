import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Search from '@/components/Search';

import DepartmentForm, { Department } from './Form';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { toast } from 'sonner';
import AppLayout from '@/layouts/AppLayout';

// Types
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

type PageProps = {
  departments: {
    data: Department[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    filters?: {
      search?: string;
    };
  };
  auth: {
    user: User | null;
  };
};

interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const DepartmentsPage: React.FC = () => {
  const { departments, auth } = usePage<PageProps>().props;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [searchValue, setSearchValue] = useState(departments.filters?.search || '');
  
  // Ensure departments.data is always an array to prevent runtime errors
  const currentPage = departments?.current_page || 1;
  const lastPage = departments?.last_page || 1;
  const isAdmin = auth.user?.role === 'admin';


  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(
        route('departments.index'), 
        { search: searchValue, page: 1 }, // Reset to first page on new search
        { preserveState: true, preserveScroll: true }
      );
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Handle page change
  const handlePageChange = (page: number) => {
    router.get(
      route('departments.index'), 
      { page, search: searchValue },
      { preserveState: true, preserveScroll: true }
    );
  };

  // Handle create department
  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  };

  // Handle edit department
  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  };

  // Handle delete department
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!departmentToDelete?.id) return;
    
    setIsDeleting(departmentToDelete.id.toString());
    
    router.delete(route('departments.destroy', departmentToDelete.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Departemen berhasil dihapus');
        setDeleteDialogOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        toast.error('Gagal menghapus departemen. Silakan coba lagi.');
      },
      onFinish: () => {
        setIsDeleting(null);
        setDepartmentToDelete(null);
      },
    });
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDepartment(null);
  };



  return (
    <AppLayout 
      auth={{ user: auth.user }} 
      header="Daftar Departemen"
    >
      <Head title="Daftar Departemen" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Departemen</h1>
            <p className="text-muted-foreground">
              Kelola data departemen yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleCreate} 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Departemen
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-grow">
                <Search
                  placeholder="Cari departemen..."
                  onSearch={setSearchValue}
                  initialValue={searchValue}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Departemen</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada data departemen'}
                      </td>
                    </tr>
                  ) : (
                    departments.data.map((dept: Department, index: number) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {(currentPage - 1) * departments.per_page + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setIsFormOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {isAdmin && (
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(dept)}
                                disabled={isDeleting === dept.id}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {isDeleting === dept.id ? 'Menghapus...' : 'Hapus'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {departments.total > 0 && (
              <div className="mt-6">
                <Pagination
                  totalItems={departments.total}
                  itemsPerPage={departments.per_page}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DepartmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={selectedDepartment ? "update" : "create"}
        onClose={handleFormClose}
        selectedDepartment={selectedDepartment || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDepartmentToDelete(null)}
        title="Hapus Departemen"
        description={`Apakah Anda yakin ingin menghapus departemen ${departmentToDelete?.name}?`}
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={!!isDeleting}
      />
    </AppLayout>
  );
};

export default DepartmentsPage;
