import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Save, UserCog, UserPlus, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserFormData, DepartmentType, PositionType } from '@/types/user';

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

const defaultFormData: UserFormData = {
  name: '',
  username: '',
  role: 'user',
  password: '',
  password_confirmation: '',
  department_id: '',
  position_id: '',
};

const FieldError = ({ id, message }: { id?: string; message?: string }) => {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      <span>{message}</span>
    </p>
  );
};

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
  const { data, setData, processing, errors: formErrors, setError, clearErrors } =
    useForm<Partial<UserFormData>>(defaultFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open && selectedUser) {
      setData({
        ...defaultFormData,
        ...selectedUser,
        department_id: selectedUser.department_id?.toString() || '',
        position_id: selectedUser.position_id?.toString() || '',
      });
    } else if (!open) {
      const timer = setTimeout(() => {
        setData(defaultFormData);
        clearErrors();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, selectedUser, setData, clearErrors]);

  const errors = { ...serverErrors, ...formErrors };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    } else if (data.name.length > 255) {
      newErrors.name = 'Nama maksimal 255 karakter';
    }

    if (!data.username?.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (data.username.length > 255) {
      newErrors.username = 'Username maksimal 255 karakter';
    }

    if (!data.role) {
      newErrors.role = 'Role wajib dipilih';
    } else if (!['admin', 'user'].includes(data.role)) {
      newErrors.role = 'Role harus admin atau user';
    }

    if (!data.department_id) {
      newErrors.department_id = 'Departemen wajib dipilih';
    }

    if (!data.position_id) {
      newErrors.position_id = 'Jabatan wajib dipilih';
    }

    if (mode === 'create') {
      if (!data.password) {
        newErrors.password = 'Password wajib diisi';
      } else if (data.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
      }

      if (data.password !== data.password_confirmation) {
        newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
      }
    }

    if (mode === 'update' && data.password) {
      if (data.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
      }

      if (data.password !== data.password_confirmation) {
        newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
      }
    }

    Object.entries(newErrors).forEach(([key, msg]) => {
      setError(key as keyof UserFormData, msg);
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) {
      return;
    }

    const formData: UserFormData = { ...data };

    if (mode === 'update' && !formData.password) {
      delete formData.password;
      delete formData.password_confirmation;
    }

    if (formData.department_id) {
      formData.department_id = formData.department_id.toString();
    }
    if (formData.position_id) {
      formData.position_id = formData.position_id.toString();
    }

    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof UserFormData, value);
    if (formErrors[name as keyof typeof formErrors]) {
      clearErrors(name as keyof typeof formErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'update' ? (
              <UserCog className="h-5 w-5 text-primary" strokeWidth={1.5} />
            ) : (
              <UserPlus className="h-5 w-5 text-primary" strokeWidth={1.5} />
            )}
            <span>{mode === 'update' ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'update'
              ? 'Perbarui informasi pengguna yang sudah ada.'
              : 'Isi formulir berikut untuk menambahkan pengguna baru.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama lengkap</Label>
            <Input
              id="name"
              name="name"
              value={data.name || ''}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={data.username || ''}
                onChange={handleInputChange}
                placeholder="Masukkan username"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              <FieldError id="username-error" message={errors.username} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                value={data.role}
                onValueChange={(value: 'admin' | 'user') => {
                  setData('role', value);
                  if (formErrors.role) clearErrors('role');
                }}
                disabled={processing}
              >
                <SelectTrigger id="role" aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <FieldError id="role-error" message={errors.role} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="department_id">Departemen</Label>
              <Select
                value={data.department_id ? String(data.department_id) : ''}
                onValueChange={(value: string) => {
                  setData('department_id', value);
                  if (errors.department_id) clearErrors('department_id');
                }}
                disabled={processing}
              >
                <SelectTrigger id="department_id" aria-invalid={!!errors.department_id}>
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="department-error" message={errors.department_id} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position_id">Jabatan</Label>
              <Select
                value={data.position_id ? String(data.position_id) : ''}
                onValueChange={(value: string) => {
                  setData('position_id', value);
                  if (errors.position_id) clearErrors('position_id');
                }}
                disabled={processing}
              >
                <SelectTrigger id="position_id" aria-invalid={!!errors.position_id}>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="position-error" message={errors.position_id} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              {mode === 'update' ? 'Password baru (opsional)' : 'Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={data.password || ''}
                onChange={handleInputChange}
                placeholder={
                  mode === 'update'
                    ? 'Kosongkan jika tidak ingin mengubah password'
                    : 'Minimal 8 karakter'
                }
                className="pr-10"
                disabled={processing}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
            <FieldError id="password-error" message={errors.password} />
          </div>

          {(mode === 'create' || !!data.password) && (
            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation">
                {mode === 'update' ? 'Konfirmasi password baru' : 'Konfirmasi password'}
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={data.password_confirmation || ''}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  className="pr-10"
                  disabled={processing}
                  aria-invalid={!!errors.password_confirmation}
                  aria-describedby={
                    errors.password_confirmation ? 'password-confirm-error' : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-pressed={showConfirmPassword}
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              <FieldError
                id="password-confirm-error"
                message={errors.password_confirmation}
              />
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
              <span>Batal</span>
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4" strokeWidth={1.5} />
              <span>{mode === 'update' ? 'Perbarui' : 'Simpan'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
