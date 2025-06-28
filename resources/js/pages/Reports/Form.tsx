import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

// Define the Report type
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

// Define the form data type
interface FormDataState {
  title: string;
  file: File | null;
  filename: string;
  [key: string]: any; // Add index signature to satisfy FormDataType constraint
}

// Define the component props
interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
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
  const { data, setData, reset, processing, errors, clearErrors } = useForm<FormDataState>({
    title: selectedReport?.title || "",
    file: null,
    filename: selectedReport?.filename || "",
    date: selectedReport?.date || new Date().toISOString().split('T')[0], // Default to today's date
  });

  // Reset form when selectedReport changes or modal is closed
  useEffect(() => {
    if (mode === "update" && selectedReport) {
      setData({
        title: selectedReport.title,
        file: null,
        filename: selectedReport.filename || "",
        date: selectedReport.date || new Date().toISOString().split('T')[0],
      });
    } else if (!open) {
      reset();
    }
  }, [selectedReport, mode, open, reset, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!data.title.trim()) {
      newErrors.title = 'Judul laporan wajib diisi';
    } else if (data.title.length > 255) {
      newErrors.title = 'Judul laporan maksimal 255 karakter';
    }
    
    if (mode === 'create' && !data.file) {
      newErrors.file = 'File laporan wajib diunggah';
    }
    
    if (Object.keys(newErrors).length > 0) {
      // @ts-ignore - Inertia's setError expects this format
      Object.entries(newErrors).forEach(([key, message]) => setError(key, message));
      return;
    }
    
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("date", data.date);
    if (data.file) {
      formData.append("file", data.file);
    }
    if (mode === "update" && selectedReport?.id) {
      formData.append("_method", "PUT");
      formData.append("id", selectedReport.id.toString());
    }
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
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
    if (file && file.type === "application/pdf") {
      setData({
        ...data,
        file,
        filename: file.name,
      });
    } else {
      alert("Hanya file PDF yang diizinkan");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Format date to Indonesian locale with time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Laporan Baru" : "Edit Laporan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi formulir untuk menambahkan laporan baru."
              : "Perbarui informasi laporan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="title">Judul Laporan</Label>
              {errors.title && (
                <span className="text-xs text-red-500">{errors.title}</span>
              )}
            </div>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => {
                setData("title", e.target.value);
                if (errors.title) clearErrors('title');
              }}
              placeholder="Masukkan judul laporan"
              className={errors.title ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label>File Laporan (PDF)</Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 ${errors.file ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.filename || "PDF (MAX. 10MB)"}
                  </p>
                  {errors.file && (
                    <p className="mt-1 text-xs text-red-500">{errors.file}</p>
                  )}
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Label>
            </div>
            {selectedReport?.updated_at && (
              <div className="mt-2 text-center">
                <div className="text-sm text-gray-500">
                  Terakhir diperbarui: {formatDate(selectedReport.updated_at)} WIB
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={processing}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {processing ? 'Memproses...' : mode === "create" ? "Simpan" : "Perbarui"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;