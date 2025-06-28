import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the Position type
export interface Position {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Define the component props
interface PositionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
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
  const { data, setData, processing, errors, reset, setError } = useForm<{name: string}>({
    name: selectedPosition?.name || "",
  });
  
  // Reset form when selectedPosition changes
  useEffect(() => {
    if (mode === "update" && selectedPosition) {
      setData({
        name: selectedPosition.name,
      });
    } else if (!open) {
      reset();
    }
  }, [selectedPosition, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('name', '');
    
    // Client-side validation
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
      <DialogContent className="sm:max-w-[425px] z-50 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {mode === "create" ? "Tambah Posisi Baru" : "Edit Posisi"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tambahkan posisi baru ke dalam sistem."
              : "Perbarui informasi posisi."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Posisi</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={data.name}
                  onChange={(e) => {
                    setData('name', e.target.value);
                    if (errors.name) setError('name', '');
                  }}
                  placeholder="Masukkan nama posisi"
                  required
                  disabled={processing}
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
            
            {mode === "update" && selectedPosition?.updated_at && (
              <div className="grid gap-2">
                <Label>Terakhir Diperbarui</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedPosition.updated_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
            >
              {processing ? 'Memproses...' : mode === "create" ? "Simpan" : "Perbarui"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PositionForm;
