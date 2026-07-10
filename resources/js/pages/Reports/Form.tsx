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
import { FileText, Calendar, Plus, Pencil, Save, X } from "lucide-react";

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
  onOpenChange = () => { },
  mode,
  onSubmit,
  selectedReport,
}) => {
  const { data, setData, reset, processing, errors, setError, clearErrors } = useForm<FormDataState>({
    title: selectedReport?.title || "",
    file: null,
    filename: selectedReport?.filename || "",
    date: selectedReport?.date ? selectedReport.date.substring(0, 10) : new Date().toISOString().split('T')[0], // Default to today's date (YYYY-MM-DD)
  });

  // Reset form when selectedReport changes or modal is closed
  useEffect(() => {
    if (mode === "update" && selectedReport) {
      setData({
        title: selectedReport.title,
        file: null,
        filename: selectedReport.filename || "",
        date: selectedReport.date ? selectedReport.date.substring(0, 10) : new Date().toISOString().split('T')[0],
      });
    } else if (!open) {
      reset();
      clearErrors();
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

    if (!data.date) {
      newErrors.date = 'Tanggal surat wajib diisi';
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
      <DialogContent
        className="sm:max-w-md bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {mode === "create" ? "Tambah Laporan Baru" : "Edit Laporan"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            {mode === "create"
              ? "Isi formulir di bawah ini untuk mengunggah dokumen laporan baru."
              : "Sesuaikan kembali informasi dokumen laporan yang diperlukan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="title" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Judul Laporan
              </Label>
              {errors.title && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                  {errors.title}
                </span>
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
              className={`h-10 border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500 ${errors.title
                ? 'border-red-300 bg-red-50/10 focus-visible:ring-red-100 focus-visible:border-red-500'
                : 'border-gray-200 bg-gray-50/30 hover:border-gray-300'
                }`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="date" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tanggal Laporan
              </Label>
              {errors.date && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                  {errors.date}
                </span>
              )}
            </div>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => {
                setData("date", e.target.value);
                if (errors.date) clearErrors('date');
              }}
              className={`h-10 border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500 ${errors.date
                ? 'border-red-300 bg-red-50/10 focus-visible:ring-red-100 focus-visible:border-red-500'
                : 'border-gray-200 bg-gray-50/30 hover:border-gray-300'
                }`}
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
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === "create" ? "Simpan" : "Perbarui"}</span>
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