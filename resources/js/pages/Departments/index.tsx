import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Search from '@/components/Search';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import DepartmentForm, { Department } from './Form';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const DepartmentsPage: React.FC = () => {
  const { departments, auth } = usePage<PageProps>().props;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [searchValue, setSearchValue] = useState(departments.filters?.search || '');

  const currentPage = departments?.current_page || 1;
  const isAdmin = auth.user?.role === 'admin';

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params: Record<string, string | number> = {};
    if (value.trim()) {
      params.search = value;
      params.page = 1;
    }
    router.get(route('departments.index'), params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handlePageChange = (page: number) => {
    router.get(
      route('departments.index'),
      { page, search: searchValue || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  };

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
      onError: () => {
        toast.error('Gagal menghapus departemen. Silakan coba lagi.');
      },
      onFinish: () => {
        setIsDeleting(null);
        setDepartmentToDelete(null);
      },
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDepartment(null);
  };

  return (
    <AppLayout auth={{ user: auth.user }} header="Daftar Departemen">
      <Head title="Daftar Departemen" />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Daftar Departemen
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola data departemen atau kantor yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleCreate} className="self-start sm:self-auto">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Tambah Departemen</span>
            </Button>
          )}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border p-4">
            <Search
              placeholder="Cari departemen"
              onSearch={handleSearch}
              initialValue={searchValue}
            />
          </div>

          {departments.data.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Nama Departemen</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.data.map((dept, index) => {
                      const itemNumber = (currentPage - 1) * departments.per_page + index + 1;
                      return (
                        <TableRow key={dept.id}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {itemNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2.5">
                              <Building2
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                strokeWidth={1.5}
                              />
                              <span>{dept.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(dept)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit"
                                aria-label={`Edit ${dept.name}`}
                              >
                                <Pencil className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(dept)}
                                  disabled={isDeleting === dept.id}
                                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title={isDeleting === dept.id ? 'Menghapus...' : 'Hapus'}
                                  aria-label={`Hapus ${dept.name}`}
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                </Button>
                              )}
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
                {departments.data.map((dept, index) => {
                  const itemNumber = (currentPage - 1) * departments.per_page + index + 1;
                  return (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-muted-foreground tabular-nums">
                          #{itemNumber}
                        </span>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {dept.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(dept)}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Edit</span>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(dept)}
                            disabled={isDeleting === dept.id}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada data departemen'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tambahkan departemen baru untuk mulai mengelompokkan pengguna.
              </p>
            </div>
          )}

          {departments.total > 0 && (
            <div className="border-t border-border px-4 py-3 sm:px-6">
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

      <DepartmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={selectedDepartment ? 'update' : 'create'}
        onClose={handleFormClose}
        selectedDepartment={selectedDepartment || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDepartmentToDelete(null)}
        title="Hapus Departemen"
        description="Apakah Anda yakin ingin menghapus departemen"
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={!!isDeleting}
        itemName={departmentToDelete?.name || ''}
      />
    </AppLayout>
  );
};

export default DepartmentsPage;
