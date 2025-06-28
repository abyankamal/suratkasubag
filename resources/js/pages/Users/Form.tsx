import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { User, Mail, Key, UserPlus, UserCog } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData, DepartmentType, PositionType } from '@/types/user';

// Define the component props
interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'update';
  onSubmit: (data: UserFormData) => void;
  selectedUser?: UserFormData | null;
  errors?: Record<string, string>;
  departments?: DepartmentType[];
  positions?: PositionType[];
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onOpenChange,
  mode,
  onSubmit,
  selectedUser,
  errors: serverErrors = {},
  departments = [],
  positions = [],
}) => {
  const defaultFormData: UserFormData = {
    name: '',
    username: '',
    role: 'user',
    password: '',
    password_confirmation: '',
    department_id: '',
    position_id: ''
  };

  // Initialize form with default values
  const { data, setData, processing, errors: formErrors, reset, setError, clearErrors } = useForm<Partial<UserFormData>>(defaultFormData);
  
  // Update form data when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      console.log('Selected user in form:', selectedUser);
      
      // Create a new object with the correct types
      const formData: Partial<UserFormData> = {
        ...selectedUser,
        // Ensure departement_id is properly set from selectedUser
        departement_id: selectedUser.departement_id?.toString() || '',
        // Ensure position_id is properly set from selectedUser
        position_id: selectedUser.position_id?.toString() || ''
      };
      
      console.log('Form data before setting:', formData);
      
      // Update form data field by field to avoid type issues
      (Object.entries(formData) as [keyof UserFormData, any][]).forEach(([key, value]) => {
        setData(key, value);
      });
    }
  }, [selectedUser, setData]);

  // Combine server and client-side errors
  const errors = { ...serverErrors, ...formErrors };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Small delay to allow the dialog animation to complete
      const timer = setTimeout(() => {
        // Reset each field individually to avoid type issues
        Object.entries(defaultFormData).forEach(([key, value]) => {
          setData(key as keyof UserFormData, value);
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open, defaultFormData, setData]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    // Validate name
    if (!data.name?.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
      isValid = false;
    } else if (data.name.length > 255) {
      newErrors.name = 'Nama maksimal 255 karakter';
      isValid = false;
    }
    
    // Validate username
    if (!data.username?.trim()) {
      newErrors.username = 'Username wajib diisi';
      isValid = false;
    } else if (data.username.length > 255) {
      newErrors.username = 'Username maksimal 255 karakter';
      isValid = false;
    }
    
    // Validate role
    if (!data.role) {
      newErrors.role = 'Role wajib dipilih';
      isValid = false;
    } else if (!['admin', 'user'].includes(data.role)) {
      newErrors.role = 'Role harus admin atau user';
      isValid = false;
    }
    
    // Validate department
    if (!data.departement_id) {
      newErrors.department_id = 'Departemen wajib dipilih';
      isValid = false;
    }
    
    // Validate position
    if (!data.position_id) {
      newErrors.position_id = 'Jabatan wajib dipilih';
      isValid = false;
    }
    
    // Password validation for create mode
    if (mode === 'create') {
      if (!data.password) {
        newErrors.password = 'Password wajib diisi';
        isValid = false;
      } else if (data.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
        isValid = false;
      }
      
      if (data.password !== data.password_confirmation) {
        newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
        isValid = false;
      }
    }
    
    // Password validation for update mode (if password is provided)
    if (mode === 'update' && data.password) {
      if (data.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
        isValid = false;
      }
      
      if (data.password !== data.password_confirmation) {
        newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
        isValid = false;
      }
    }
    
    // Set all errors at once
    Object.keys(newErrors).forEach(key => {
      setError(key as keyof UserFormData, newErrors[key]);
    });
    
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all errors first
    clearErrors();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Create a new object with the form data
    const formData: UserFormData = { ...data };
    
    // Remove password fields if they're empty in edit mode
    if (mode === 'update' && !formData.password) {
      delete formData.password;
      delete formData.password_confirmation;
    }
    
    // Ensure departement_id and position_id are strings
    if (formData.departement_id) {
      formData.departement_id = formData.departement_id.toString();
    }
    if (formData.position_id) {
      formData.position_id = formData.position_id.toString();
    }
    
    onSubmit(formData);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(name as keyof UserFormData, value as any);
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      clearErrors(name as keyof typeof formErrors);
    }
  };

  // Handle select change
  const handleSelectChange = (name: keyof UserFormData, value: string) => {
    setData(name, value as any);
    
    // Clear error when user selects an option
    if (formErrors[name as keyof typeof formErrors]) {
      clearErrors(name as keyof typeof formErrors);
    }
  };

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] z-50 bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'update' ? (
              <>
                <UserCog className="h-5 w-5" />
                Edit Pengguna
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Tambah Pengguna Baru
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'update'
              ? "Perbarui informasi pengguna yang sudah ada."
              : "Isi formulir berikut untuk menambahkan pengguna baru."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 pr-1">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    onChange={handleInputChange}
                    value={data.name || ''}
                    placeholder="Nama Lengkap"
                    className={`w-full ${errors.name ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''}`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    value={data.username || ''}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className={`w-full ${errors.username ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''}`}
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                  {errors.username && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.username && (
                  <p id="username-error" className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <div className="space-y-1">
                <div className={`relative ${errors.role ? 'has-error' : ''}`}>
                  <Select
                    value={data.role}
                    onValueChange={(value: 'admin' | 'user') => handleSelectChange('role', value)}
                    disabled={processing}
                  >
                    <SelectTrigger className={`bg-white ${errors.role ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.role && (
                  <p id="role-error" className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            {mode === 'create' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password || ''}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (errors.password) clearErrors('password');
                        }}
                        placeholder="Password"
                        className={`w-full ${errors.password ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''} pr-10`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-sm text-red-600 flex items-start">
                      <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={data.password_confirmation || ''}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (errors.password_confirmation) clearErrors('password_confirmation');
                        }}
                        placeholder="Konfirmasi Password"
                        className={`w-full ${errors.password_confirmation ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''} pr-10`}
                        aria-invalid={!!errors.password_confirmation}
                        aria-describedby={errors.password_confirmation ? 'password-confirm-error' : undefined}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.password_confirmation && (
                    <p id="password-confirm-error" className="mt-2 text-sm text-red-600 flex items-start">
                      <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>
              </>
            )}

            {mode === 'update' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password Baru (opsional)</Label>
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password || ''}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (errors.password) clearErrors('password');
                        }}
                        placeholder="Kosongkan jika tidak ingin mengubah password"
                        className={`w-full ${errors.password ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''} pr-10`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        disabled={processing}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={processing}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-sm text-red-600 flex items-start">
                      <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {data.password && (
                  <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                    <div className="space-y-1">
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={data.password_confirmation || ''}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (errors.password_confirmation) clearErrors('password_confirmation');
                          }}
                          placeholder="Konfirmasi password baru"
                          className={`w-full ${errors.password_confirmation ? 'border-red-500 focus-visible:ring-red-500 pr-10' : ''} pr-10`}
                          aria-invalid={!!errors.password_confirmation}
                          aria-describedby={errors.password_confirmation ? 'password-confirm-error' : undefined}
                          disabled={processing}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={processing}
                          aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                        >
                          {showConfirmPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password_confirmation && (
                        <p id="password-confirm-error" className="mt-2 text-sm text-red-600 flex items-start">
                          <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="departement_id">Departemen</Label>
              <div className="space-y-1">
                <div className={`relative ${errors.department_id ? 'has-error' : ''}`}>
                  <Select
                    value={data.departement_id ? String(data.departement_id) : ''}
                    onValueChange={(value: string) => {
                      setData('departement_id' as keyof UserFormData, value);
                      if (errors.department_id) {
                        clearErrors('department_id');
                      }
                    }}
                    disabled={processing}
                  >
                    <SelectTrigger className={`bg-white ${errors.department_id ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && (
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.department_id && (
                  <p id="department-error" className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.department_id}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position_id">Jabatan</Label>
              <div className="space-y-1">
                <div className={`relative ${errors.position_id ? 'has-error' : ''}`}>
                  <Select
                    value={data.position_id ? String(data.position_id) : ''}
                    onValueChange={(value: string) => {
                      setData('position_id' as keyof UserFormData, value);
                      if (errors.position_id) {
                        clearErrors('position_id');
                      }
                    }}
                    disabled={processing}
                  >
                    <SelectTrigger className={`bg-white ${errors.position_id ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id.toString()}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position_id && (
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.position_id && (
                  <p id="position-error" className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.position_id}
                  </p>
                )}
              </div>
            </div>

            {/* Avatar upload removed as requested */}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {mode === 'update' ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
