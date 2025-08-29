import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import Search from '@/components/Search';
import PositionForm from './Form';
import type { Position } from './Form';
import { Pagination } from '@/components/Pagination';
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

interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const PositionsPage: React.FC = () => {
  const { positions, auth } = usePage<PageProps>().props;
  const [searchValue, setSearchValue] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>(positions.data || []);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(
        route('positions.index'), 
        { search: searchValue, page: 1 }, // Reset to first page on search
        { preserveState: true, preserveScroll: true }
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);
  
  const currentPage = positions?.current_page || 1;
  const lastPage = positions?.last_page || 1;
  const isAdmin = auth.user?.role === 'admin';

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    router.get(route('positions.index'), { page }, { preserveState: true });
  };

  // Handle create position
  const handleCreate = () => {
    setSelectedPosition(null);
    setIsFormOpen(true);
  };

  // Handle edit position
  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsFormOpen(true);
  };

  // Handle delete position
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

  // Handle form submission (create/update)
  const handlePositionSubmit = (data: { name: string }) => {
    const options = {
      onSuccess: () => {
        setIsFormOpen(false);
        setSelectedPosition(null);
        toast.success(selectedPosition ? 'Posisi berhasil diperbarui' : 'Posisi berhasil dibuat');
      },
      onError: () => {
        toast.error(`Gagal ${selectedPosition ? 'memperbarui' : 'membuat'} posisi. Silakan coba lagi.`);
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
    <AppLayout 
      auth={{ user: auth.user }} 
      header="Daftar Posisi"
    >
      <Head title="Daftar Posisi" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Posisi</h1>
            <p className="text-muted-foreground">
              Kelola data posisi yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleCreate} 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Posisi
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-grow">
                <Search
                  placeholder="Cari posisi..."
                  onSearch={handleSearch}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Posisi</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada data posisi'}
                      </td>
                    </tr>
                  ) : (
                    positions.data.map((position: Position, index: number) => (
                      <tr key={position.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {(currentPage - 1) * positions.per_page + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{position.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(position)}
                              className="border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteClick(position)}
                                disabled={!!isDeleting && isDeleting === position.id}
                                className="border-gray-200 hover:bg-red-50 hover:text-red-600"
                                title={isDeleting === position.id ? 'Menghapus...' : 'Hapus'}
                              >
                                <Trash2 className="h-4 w-4" />
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

            {positions.total > 0 && (
              <div className="mt-6">
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

      {/* Delete Confirmation Dialog */}
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
