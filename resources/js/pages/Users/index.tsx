import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Trash2, UserPlus, Pencil, Users as UsersIcon } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Search from '@/components/Search';
import { Pagination } from '@/components/Pagination';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { UserAvatar } from '@/components/UserAvatar';
import UserForm from '@/pages/Users/Form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserType,
  UserFormData,
  UsersPageProps,
} from '@/types/user';

const defaultPagination = {
  data: [],
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
  from: 0,
  to: 0,
  links: [],
};

export default function UsersPage({
  auth,
  users = defaultPagination,
  departments = [],
  positions = [],
  errors = {},
  filters = {},
}: UsersPageProps & { filters?: { search?: string } }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const {
    data = [],
    current_page = 1,
    per_page = 10,
    total = 0,
    from = 0,
  } = users;

  const isAdmin = auth.user?.role === 'admin';
  const currentItems = data || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params: Record<string, string> = {};
    if (value.trim()) {
      params.search = value;
    }
    router.get(route('users.index'), params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const mapApiUserToFormData = (user: UserType): UserFormData => ({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    password: '',
    password_confirmation: '',
    avatar: user.avatar || null,
    department_id:
      user.department_id?.toString() ||
      (typeof user.department === 'object' && user.department?.id
        ? user.department.id.toString()
        : ''),
    position_id:
      user.position_id?.toString() ||
      (typeof user.position === 'object' && user.position?.id
        ? user.position.id.toString()
        : ''),
  });

  const handleEditUser = (user: UserType) => {
    setSelectedUser(mapApiUserToFormData(user));
    setIsFormOpen(true);
  };

  const handleSubmit = (submittedData: UserFormData) => {
    const url = submittedData.id
      ? route('users.update', submittedData.id)
      : route('users.store');

    const method = submittedData.id ? 'put' : 'post';

    if (!submittedData.name || !submittedData.username || !submittedData.role) {
      toast.error('Harap isi semua kolom yang wajib diisi');
      return;
    }

    const form = new FormData();

    Object.entries(submittedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof File) {
          form.append(key, value);
        } else if (typeof value === 'object') {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      }
    });

    if (method !== 'post') {
      form.append('_method', method);
    }

    router.post(url, form, {
      onSuccess: () => {
        toast.success(`Pengguna berhasil ${submittedData.id ? 'diperbarui' : 'dibuat'}`);
        setIsFormOpen(false);
        setSelectedUser(null);
      },
      onError: () => {
        toast.error('Terjadi kesalahan. Silakan periksa kembali data yang dimasukkan');
      },
      preserveScroll: true,
    });
  };

  const handlePageChange = (page: number) => {
    router.get(
      route('users.index'),
      { page, search: searchTerm || undefined },
      {
        preserveState: true,
        only: ['users'],
        replace: true,
      }
    );
  };

  const handleOpenDeleteDialog = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    router.delete(route('users.destroy', userToDelete), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      },
    });
  };

  return (
    <AppLayout auth={auth} header="Daftar Pengguna">
      <Head title="Daftar Pengguna" />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Daftar Pengguna
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola data pengguna yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setSelectedUser(null);
                setIsFormOpen(true);
              }}
              className="self-start sm:self-auto"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.5} />
              <span>Tambah Pengguna</span>
            </Button>
          )}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border p-4">
            <Search
              placeholder="Cari pengguna"
              onSearch={handleSearch}
              initialValue={searchTerm}
            />
          </div>

          {currentItems.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((user: any, index: number) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {from + index}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} imageSrc={user.avatar} className="h-8 w-8" />
                            <span className="font-medium text-foreground">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          @{user.username}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'success' : 'secondary'}>
                            {user.displayRole || (user.role === 'admin' ? 'Admin' : 'User')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.position || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.department || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit"
                              aria-label={`Edit ${user.name}`}
                            >
                              <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDeleteDialog(user.id)}
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Hapus"
                                aria-label={`Hapus ${user.name}`}
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="divide-y divide-border md:hidden">
                {currentItems.map((user: any, index: number) => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={user.name} imageSrc={user.avatar} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground tabular-nums">
                              #{from + index}
                            </span>
                            <Badge variant={user.role === 'admin' ? 'success' : 'secondary'}>
                              {user.displayRole || (user.role === 'admin' ? 'Admin' : 'User')}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {user.position || '-'} &middot; {user.department || '-'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Edit</span>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(user.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <UsersIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Tidak ada data pengguna
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tambahkan pengguna baru atau ubah kata kunci pencarian.
              </p>
            </div>
          )}

          {total > 0 && (
            <div className="border-t border-border px-4 py-3 sm:px-6">
              <Pagination
                totalItems={total}
                itemsPerPage={per_page}
                currentPage={current_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={selectedUser ? 'update' : 'create'}
        onSubmit={handleSubmit}
        selectedUser={selectedUser}
        errors={errors}
        departments={departments}
        positions={positions}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna"
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
        itemName={currentItems.find((user) => user.id === userToDelete)?.name || ''}
      />
    </AppLayout>
  );
}
