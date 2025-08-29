import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, Pencil } from 'lucide-react';
import Search from '@/components/Search';
import { Pagination } from '@/components/Pagination';
import { toast } from 'sonner';
import UserForm from '@/pages/Users/Form';
import AppLayout from '@/layouts/AppLayout';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { 
  UserType, 
  DepartmentType, 
  PositionType, 
  UserFormData,
  UsersPageProps,
  PaginatedResponse
} from '@/types/user';

// Default pagination data
const defaultPagination = {
  data: [],
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
  from: 0,
  to: 0,
  links: []
};

// Extend the base page props with our custom props
export default function UsersPage({ 
  auth, 
  users = defaultPagination,
  departments = [],
  positions = [],
  errors = {},
  ...props 
}: UsersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get flash messages from Inertia
  const { flash } = usePage().props as any;
  
  // Show toast notifications for flash messages
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);
  
  // Extract pagination data with defaults
  const {
    data = [],
    current_page = 1,
    per_page = 10,
    total = 0,
    last_page = 1,
    from = 0,
    to = 0,
    links = []
  } = users;
  
  const isAdmin = auth.user?.role === 'admin';
  // Show pagination if there's more than one page
  const hasPagination = total > per_page;
  
  // Get the current page items
  const currentItems = data || [];
  
  // Pagination constants
  const ITEMS_PER_PAGE = 10;
  
  // Filter users based on search term
  const filteredUsers = currentItems.filter((user: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.department && user.department.toLowerCase().includes(searchLower)) ||
      (user.position && user.position.toLowerCase().includes(searchLower))
    );
  });
  
  // Use filtered users or all users if no search term
  const displayUsers = searchTerm ? filteredUsers : currentItems;

  const loading = false; // Loading is handled by Inertia

  // Map API user to form data with proper type conversion
  const mapApiUserToFormData = (user: UserType): UserFormData => {
    const formData: UserFormData = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      password: '',
      password_confirmation: '',
      avatar: user.avatar || null,
      // Handle both possible property names for department ID
      department_id: user.department_id?.toString() || 
                     (user.department?.id ? user.department.id.toString() : ''),
      // Handle both possible property names for position ID
      position_id: user.position_id?.toString() || 
                  (user.position?.id ? user.position.id.toString() : '')
    };
    
    return formData;
  };

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    role: 'user',
    password: '',
    password_confirmation: '',
    avatar: null,
    departement_id: '',
    position_id: ''
  });

  // Update form data when  // Handle edit user
  const handleEditUser = (user: UserType) => {
    const formData = mapApiUserToFormData(user);
    setSelectedUser(formData);
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleSubmit = (formData: UserFormData) => {
    const url = formData.id 
      ? route('users.update', formData.id)
      : route('users.store');
    
    const method = formData.id ? 'put' : 'post';
    
    // Ensure required fields are present
    if (!formData.name || !formData.username || !formData.role) {
      toast.error('Harap isi semua kolom yang wajib diisi');
      return;
    }
    
    // Prepare form data with correct field names
    const formDataToSend = {
      ...formData,
      // Keep departement_id as is since backend expects it with this spelling
      // We don't need to map or remove fields here
    };

    const form = new FormData();
    
    // Append all fields with proper type handling
    Object.entries(formDataToSend).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof File) {
          form.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      }
    });

    // Add _method for Laravel to handle PUT/PATCH requests
    if (method !== 'post') {
      form.append('_method', method);
    }

    router.post(url, form, {
      onSuccess: () => {
        toast.success(`Pengguna berhasil ${formData.id ? 'diperbarui' : 'dibuat'}`);
        setIsFormOpen(false);
        setSelectedUser(null);
      },
      onError: () => {
        toast.error('Terjadi kesalahan. Silakan periksa kembali data yang dimasukkan');
      },
      preserveScroll: true,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    router.get(route('users.index'), { page }, {
      preserveState: true,
      only: ['users'],
      replace: true
    });
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Delete user after confirmation
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    router.delete(route('users.destroy', userToDelete), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    });
  };

  return (
    <AppLayout 
      auth={auth}
      header="Daftar User"
    >
      <Head title="Daftar User" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
            <p className="text-muted-foreground">
              Kelola data pengguna yang ada di sistem
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => {
                setSelectedUser(null);
                setIsFormOpen(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Tambah Pengguna
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-grow">
                <Search
                  placeholder="Cari pengguna..."
                  onSearch={setSearchTerm}
                  initialValue={searchTerm}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kantor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data pengguna
                    </td>
                  </tr>
                ) : (
                  displayUsers.map((user: any, index: number) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {from + index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-700 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        @{user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.displayRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.position || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            className="border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(user.id)}
                              className="border-gray-200 hover:bg-red-50 hover:text-red-600"
                              title="Hapus"
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

            {/* Always show pagination component if there are items */}
            {total > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
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
      </div>

      {/* User Form Modal */}
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
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna"
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
        itemName={currentItems.find(user => user.id === userToDelete)?.name || ''}
      />
    </AppLayout>
  );
}
