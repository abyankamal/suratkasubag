import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Search from '@/components/Search';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import PositionForm from './Form';
import type { Position } from './Form';
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
  positions: {
    data: Position[];
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

const PositionsPage: React.FC = () => {
  const { positions, auth } = usePage<PageProps>().props;
  const [searchValue, setSearchValue] = useState(positions.filters?.search || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const currentPage = positions?.current_page || 1;
  const isAdmin = auth.user?.role === 'admin';

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params: Record<string, string | number> = {};
    if (value.trim()) {
      params.search = value;
      params.page = 1;
    }
    router.get(route('positions.index'), params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handlePageChange = (page: number) => {
    router.get(
      route('positions.index'),
      { page, search: searchValue || undefined },
      { preserveState: true }
    );
  };

  const handleCreate = () => {
    setSelectedPosition(null);
    setIsFormOpen(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!positionToDelete || !positionToDelete.id) return;

    setIsDeleting(positionToDelete.id);

    router.delete(route('positions.destroy', positionToDelete.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Posisi berhasil dihapus');
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error('Gagal menghapus posisi. Silakan coba lagi.');
      },
      onFinish: () => {
        setIsDeleting(null);
        setPositionToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPositionToDelete(null);
  };

  const handlePositionSubmit = (data: { name: string }) => {
    const options = {
      onSuccess: () => {
        setIsFormOpen(false);
        setSelectedPosition(null);
        toast.success(
          selectedPosition ? 'Posisi berhasil diperbarui' : 'Posisi berhasil dibuat'
        );
      },
      onError: () => {
        toast.error(
          `Gagal ${selectedPosition ? 'memperbarui' : 'membuat'} posisi. Silakan coba lagi.`
        );
      },
      preserveScroll: true,
    };

    if (selectedPosition) {
      router.put(route('positions.update', selectedPosition.id), data, options);
    } else {
      router.post(route('positions.store'), data, options);
    }
  };

  return (
    <AppLayout auth={{ user: auth.user }} header="Daftar Posisi">
      <Head title="Daftar Posisi" />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Daftar Posisi
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola data jabatan atau posisi yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleCreate} className="self-start sm:self-auto">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Tambah Posisi</span>
            </Button>
          )}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border p-4">
            <Search
              placeholder="Cari posisi"
              onSearch={handleSearch}
              initialValue={searchValue}
            />
          </div>

          {positions.data.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Nama Posisi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.data.map((position, index) => {
                      const itemNumber = (currentPage - 1) * positions.per_page + index + 1;
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {itemNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2.5">
                              <Briefcase
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                strokeWidth={1.5}
                              />
                              <span>{position.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(position)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit"
                                aria-label={`Edit ${position.name}`}
                              >
                                <Pencil className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(position)}
                                  disabled={!!isDeleting && isDeleting === position.id}
                                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title={isDeleting === position.id ? 'Menghapus...' : 'Hapus'}
                                  aria-label={`Hapus ${position.name}`}
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
                {positions.data.map((position, index) => {
                  const itemNumber = (currentPage - 1) * positions.per_page + index + 1;
                  return (
                    <div
                      key={position.id}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-muted-foreground tabular-nums">
                          #{itemNumber}
                        </span>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {position.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(position)}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Edit</span>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(position)}
                            disabled={!!isDeleting && isDeleting === position.id}
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
                <Briefcase className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada data posisi'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tambahkan posisi atau jabatan baru ke dalam sistem.
              </p>
            </div>
          )}

          {positions.total > 0 && (
            <div className="border-t border-border px-4 py-3 sm:px-6">
              <Pagination
                totalItems={positions.total}
                itemsPerPage={positions.per_page}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <PositionForm
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setSelectedPosition(null);
          }
        }}
        mode={selectedPosition ? 'update' : 'create'}
        onSubmit={handlePositionSubmit}
        selectedPosition={selectedPosition || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Hapus Posisi"
        description="Apakah Anda yakin ingin menghapus posisi"
        itemName={positionToDelete?.name}
        isLoading={!!isDeleting}
      />
    </AppLayout>
  );
};

export default PositionsPage;
