import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ChangePasswordFormProps {
  onCancel: () => void;
}

export default function ChangePasswordForm({ onCancel }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  type FormData = {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  };

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData | 'form', string>>>({});
  
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FormData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const { flash } = usePage().props as any;

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setSuccessMessage(flash.success);
      reset();
      setTimeout(() => onCancel(), 1500);
    }
    if (flash?.error) {
      setFormErrors(prev => ({
        ...prev,
        form: flash.error as string
      }));
    }
  }, [flash, onCancel, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    post(route('profile.password.update'), {
      onSuccess: () => {
        setSuccessMessage('Password berhasil diperbarui');
        reset();
        setTimeout(() => onCancel(), 1500);
      },
      onError: (errors) => {
        // Handle server-side validation errors
        const newErrors: Partial<Record<keyof FormData | 'form', string>> = {};
        (Object.keys(errors) as Array<keyof FormData>).forEach((field) => {
          if (field in data) {
            newErrors[field] = Array.isArray(errors[field]) 
              ? (errors[field] as unknown as string[])[0] 
              : errors[field] as string;
          }
        });
        setFormErrors(newErrors);
      },
      preserveScroll: true
    });
  };
  
  const handleInputChange = (field: keyof FormData, value: string) => {
    setData(field, value);
    // Clear error when user types
    if (formErrors[field] || errors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      clearErrors(field);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Ubah Password</h2>
      
      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Form Error Message */}
      {formErrors.form && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {formErrors.form}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="current_password">Password Saat Ini</Label>
          <div className="relative">
            <Input
              id="current_password"
              name="current_password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={data.current_password}
              onChange={(e) => handleInputChange('current_password', e.target.value)}
              placeholder="Masukkan password saat ini"
              className={`w-full pr-10 ${formErrors.current_password || errors.current_password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('current')}
              tabIndex={-1}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {(formErrors.current_password || errors.current_password) && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {formErrors.current_password || errors.current_password}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="new_password">Password Baru</Label>
          <div className="relative">
            <Input
              id="new_password"
              name="new_password"
              type={showNewPassword ? 'text' : 'password'}
              value={data.new_password}
              onChange={(e) => handleInputChange('new_password', e.target.value)}
              placeholder="Masukkan password baru (minimal 8 karakter)"
              className={`w-full pr-10 ${formErrors.new_password || errors.new_password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('new')}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {(formErrors.new_password || errors.new_password) && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {formErrors.new_password || errors.new_password}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="new_password_confirmation">Konfirmasi Password Baru</Label>
          <div className="relative">
            <Input
              id="new_password_confirmation"
              name="new_password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              value={data.new_password_confirmation}
              onChange={(e) => handleInputChange('new_password_confirmation', e.target.value)}
              placeholder="Konfirmasi password baru"
              className={`w-full pr-10 ${formErrors.new_password_confirmation || errors.new_password_confirmation ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('confirm')}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {(formErrors.new_password_confirmation || errors.new_password_confirmation) && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {formErrors.new_password_confirmation || errors.new_password_confirmation}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onCancel();
            }}
            disabled={processing}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={processing}
          >
            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}