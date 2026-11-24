import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Briefcase, Save, X } from 'lucide-react';
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

export interface Position {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface PositionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'update';
  onSubmit: (data: { name: string }) => void;
  selectedPosition?: Position;
}

const PositionForm: React.FC<PositionFormProps> = ({
  open,
  onOpenChange,
  mode,
  onSubmit,
  selectedPosition,
}) => {
  const { data, setData, processing, errors, reset, setError } = useForm<{ name: string }>({
    name: selectedPosition?.name || '',
  });

  useEffect(() => {
    if (mode === 'update' && selectedPosition) {
      setData({
        name: selectedPosition.name,
      });
    } else if (!open) {
      reset();
    }
  }, [selectedPosition, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('name', '');

    if (!data.name.trim()) {
      setError('name', 'Nama posisi wajib diisi');
      return;
    }

    if (data.name.length > 255) {
      setError('name', 'Nama posisi maksimal 255 karakter');
      return;
    }

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span>{mode === 'create' ? 'Tambah Posisi Baru' : 'Edit Posisi'}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tambahkan posisi baru ke dalam sistem.'
              : 'Perbarui informasi posisi.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pos-name">Nama posisi</Label>
            <Input
              id="pos-name"
              name="name"
              value={data.name}
              onChange={(e) => {
                setData('name', e.target.value);
                if (errors.name) setError('name', '');
              }}
              placeholder="Masukkan nama posisi"
              required
              disabled={processing}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'pos-name-error' : undefined}
            />
            {errors.name && (
              <p
                id="pos-name-error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {mode === 'update' && selectedPosition?.updated_at && (
            <p className="text-xs text-muted-foreground tabular-nums">
              Terakhir diperbarui:{' '}
              {new Date(selectedPosition.updated_at).toLocaleString('id-ID', {
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

export default PositionForm;
