import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Building2, Save, X } from 'lucide-react';
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

type FormData = {
  name: string;
};

export interface Department {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'update';
  onClose: () => void;
  selectedDepartment?: Department;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  open,
  onOpenChange,
  mode,
  onClose,
  selectedDepartment,
}) => {
  const { data, setData, post, put, processing, errors, reset, setError } =
    useForm<FormData>({
      name: selectedDepartment?.name || '',
    });

  useEffect(() => {
    if (open) {
      if (mode === 'update' && selectedDepartment) {
        setData('name', selectedDepartment.name || '');
      } else if (mode === 'create') {
        reset();
      }
    }
  }, [open, mode, selectedDepartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('name', '');

    if (!data.name.trim()) {
      setError('name', 'Nama departemen wajib diisi');
      return;
    }

    if (data.name.length > 255) {
      setError('name', 'Nama departemen maksimal 255 karakter');
      return;
    }

    if (mode === 'create') {
      post(route('departments.store'), {
        onSuccess: () => onClose(),
        onError: (errs) => {
          if (errs.name) setError('name', errs.name);
        },
        preserveScroll: true,
      });
    } else if (mode === 'update' && selectedDepartment) {
      put(route('departments.update', selectedDepartment.id), {
        onSuccess: () => onClose(),
        onError: (errs) => {
          if (errs.name) setError('name', errs.name);
        },
        preserveScroll: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof FormData, value);
    if (errors[name as keyof typeof errors]) {
      setError(name as keyof FormData, '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span>
              {mode === 'create' ? 'Tambah Departemen Baru' : 'Edit Departemen'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tambahkan departemen baru ke dalam sistem.'
              : 'Perbarui informasi departemen.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Nama departemen</Label>
            <Input
              id="dept-name"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Masukkan nama departemen"
              required
              disabled={processing}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'dept-name-error' : undefined}
            />
            {errors.name && (
              <p
                id="dept-name-error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {mode === 'update' && selectedDepartment?.updated_at && (
            <p className="text-xs text-muted-foreground tabular-nums">
              Terakhir diperbarui:{' '}
              {new Date(selectedDepartment.updated_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
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
              <span>
                {processing ? 'Memproses...' : mode === 'create' ? 'Simpan' : 'Perbarui'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentForm;
