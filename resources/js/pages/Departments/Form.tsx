import { useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Building2 } from "lucide-react";

type FormData = {
  name: string;
};
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

// Define the Department type
export interface Department {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Define the component props
interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
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
  const { data, setData, post, put, processing, errors, reset, setError } = useForm<FormData>({
    name: selectedDepartment?.name || "",
  });
  
  const { flash } = usePage().props;
  
  // Reset form when selectedDepartment changes or form opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "update" && selectedDepartment) {
        setData('name', selectedDepartment.name || "");
      } else if (mode === "create") {
        reset();
      }
    }
  }, [open, mode, selectedDepartment]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('name', '');
    
    // Client-side validation
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
        onError: (errors) => {
          // Handle server-side errors
          if (errors.name) {
            setError('name', errors.name);
          }
        },
        preserveScroll: true,
      });
    } else if (mode === 'update' && selectedDepartment) {
      put(route('departments.update', selectedDepartment.id), {
        onSuccess: () => onClose(),
        onError: (errors) => {
          // Handle server-side errors
          if (errors.name) {
            setError('name', errors.name);
          }
        },
        preserveScroll: true,
      });
    }
  };


  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof FormData, value);
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setError(name as keyof FormData, '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-50 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {mode === "create" ? "Tambah Departemen Baru" : "Edit Departemen"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tambahkan departemen baru ke dalam sistem."
              : "Perbarui informasi departemen."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Departemen</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama departemen"
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
            
            {mode === "update" && selectedDepartment?.updated_at && (
              <div className="grid gap-2">
                <Label>Terakhir Diperbarui</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedDepartment.updated_at).toLocaleString('id-ID', {
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

export default DepartmentForm;
