import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangePasswordFormProps {
  onCancel: () => void;
}

type FormData = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export default function ChangePasswordForm({ onCancel }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData | 'form', string>>
  >({});

  const { data, setData, post, processing, errors, reset, clearErrors } =
    useForm<FormData>({
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    });

  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.success) {
      setSuccessMessage(flash.success);
      reset();
      const timer = setTimeout(() => onCancel(), 1200);
      return () => clearTimeout(timer);
    }
    if (flash?.error) {
      setFormErrors((prev) => ({
        ...prev,
        form: flash.error as string,
      }));
    }
  }, [flash, onCancel, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    post(route('profile.password.update'), {
      onSuccess: () => {
        setSuccessMessage('Password berhasil diperbarui');
        toast.success('Password berhasil diperbarui');
        reset();
        setTimeout(() => onCancel(), 1200);
      },
      onError: (errs) => {
        const newErrors: Partial<Record<keyof FormData | 'form', string>> = {};
        (Object.keys(errs) as Array<keyof FormData>).forEach((field) => {
          if (field in data) {
            newErrors[field] = Array.isArray(errs[field])
              ? (errs[field] as unknown as string[])[0]
              : (errs[field] as string);
          }
        });
        setFormErrors(newErrors);
      },
      preserveScroll: true,
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setData(field, value);
    if (formErrors[field] || errors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      clearErrors(field);
    }
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="border-success/30 bg-success/10 text-success">
          <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {formErrors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
          <AlertDescription>{formErrors.form}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current_password">Password saat ini</Label>
          <div className="relative">
            <Input
              id="current_password"
              name="current_password"
              type={showCurrentPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={data.current_password}
              onChange={(e) => handleInputChange('current_password', e.target.value)}
              placeholder="Masukkan password saat ini"
              className="pr-10"
              aria-invalid={!!(formErrors.current_password || errors.current_password)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-pressed={showCurrentPassword}
              aria-label={
                showCurrentPassword ? 'Sembunyikan password' : 'Tampilkan password'
              }
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {(formErrors.current_password || errors.current_password) && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{formErrors.current_password || errors.current_password}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new_password">Password baru</Label>
          <div className="relative">
            <Input
              id="new_password"
              name="new_password"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={data.new_password}
              onChange={(e) => handleInputChange('new_password', e.target.value)}
              placeholder="Minimal 8 karakter"
              className="pr-10"
              aria-invalid={!!(formErrors.new_password || errors.new_password)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-pressed={showNewPassword}
              aria-label={
                showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'
              }
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {(formErrors.new_password || errors.new_password) && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{formErrors.new_password || errors.new_password}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new_password_confirmation">Konfirmasi password baru</Label>
          <div className="relative">
            <Input
              id="new_password_confirmation"
              name="new_password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={data.new_password_confirmation}
              onChange={(e) =>
                handleInputChange('new_password_confirmation', e.target.value)
              }
              placeholder="Ulangi password baru"
              className="pr-10"
              aria-invalid={
                !!(
                  formErrors.new_password_confirmation ||
                  errors.new_password_confirmation
                )
              }
              required
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
          {(formErrors.new_password_confirmation ||
            errors.new_password_confirmation) && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>
                {formErrors.new_password_confirmation ||
                  errors.new_password_confirmation}
              </span>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
          <Button type="submit" disabled={processing}>
            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
