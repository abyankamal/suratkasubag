import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle, Loader2, Save, Upload, X } from 'lucide-react';

export interface Report {
  id?: number;
  title: string;
  filename: string;
  original_filename?: string;
  file_path?: string;
  date?: string;
  user_id?: number;
  uploader?: string;
  created_at?: string;
  updated_at?: string;
  file?: File | null;
}

interface FormDataState {
  title: string;
  file: File | null;
  filename: string;
  date: string;
  [key: string]: any;
}

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'update';
  onSubmit: (data: FormData) => void;
  selectedReport?: Report;
}

const ReportForm: React.FC<ReportFormProps> = ({
  open,
  onOpenChange = () => {},
  mode,
  onSubmit,
  selectedReport,
}) => {
  const { data, setData, reset, processing, errors, setError, clearErrors } =
    useForm<FormDataState>({
      title: selectedReport?.title || '',
      file: null,
      filename: selectedReport?.filename || '',
      date: selectedReport?.date
        ? selectedReport.date.substring(0, 10)
        : new Date().toISOString().split('T')[0],
    });

  useEffect(() => {
    if (mode === 'update' && selectedReport) {
      setData({
        title: selectedReport.title,
        file: null,
        filename: selectedReport.filename || '',
        date: selectedReport.date
          ? selectedReport.date.substring(0, 10)
          : new Date().toISOString().split('T')[0],
      });
    } else if (!open) {
      reset();
      clearErrors();
    }
  }, [selectedReport, mode, open, reset, setData, clearErrors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const newErrors: Record<string, string> = {};

    if (!data.title.trim()) {
      newErrors.title = 'Judul laporan wajib diisi';
    } else if (data.title.length > 255) {
      newErrors.title = 'Judul laporan maksimal 255 karakter';
    }

    if (mode === 'create' && !data.file) {
      newErrors.file = 'File laporan wajib diunggah';
    }

    if (!data.date) {
      newErrors.date = 'Tanggal surat wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([key, message]) =>
        setError(key as keyof FormDataState, message)
      );
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('date', data.date);
    if (data.file) {
      formData.append('file', data.file);
    }
    if (mode === 'update' && selectedReport?.id) {
      formData.append('_method', 'PUT');
      formData.append('id', selectedReport.id.toString());
    }
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('file', 'Hanya file berformat PDF yang diizinkan');
        toast.error('Hanya file berformat PDF yang diizinkan');
        return;
      }
      clearErrors('file');
      setData({
        ...data,
        file,
        filename: file.name,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      clearErrors('file');
      setData({
        ...data,
        file,
        filename: file.name,
      });
    } else {
      setError('file', 'Hanya file berformat PDF yang diizinkan');
      toast.error('Hanya file berformat PDF yang diizinkan');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Laporan Baru' : 'Edit Laporan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi formulir di bawah ini untuk mengunggah dokumen laporan baru.'
              : 'Sesuaikan informasi dokumen laporan yang diperlukan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul laporan</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => {
                setData('title', e.target.value);
                if (errors.title) clearErrors('title');
              }}
              placeholder="Masukkan judul laporan"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Tanggal laporan</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => {
                setData('date', e.target.value);
                if (errors.date) clearErrors('date');
              }}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && (
              <p id="date-error" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errors.date}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dropzone-file">File laporan (PDF)</Label>
            <Label
              htmlFor="dropzone-file"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/40 px-4 text-center transition-colors hover:bg-muted/70 ${
                errors.file ? 'border-destructive' : 'border-border'
              }`}
            >
              <Upload className="mb-2.5 h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-foreground">
                <span className="font-medium text-primary">Klik untuk mengunggah</span> atau seret ke sini
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate max-w-full">
                {data.filename || 'PDF (maksimal 10MB)'}
              </p>
              <Input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </Label>
            {errors.file && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>{errors.file}</span>
              </p>
            )}
            {selectedReport?.updated_at && (
              <p className="pt-1 text-xs text-muted-foreground tabular-nums">
                Terakhir diperbarui: {formatDate(selectedReport.updated_at)} WIB
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
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
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" strokeWidth={1.5} />
                  <span>{mode === 'create' ? 'Simpan' : 'Perbarui'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
