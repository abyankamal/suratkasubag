import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { redirectIfAuthenticated } from '@/middleware/AuthMiddleware';
import { type SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export default function Login() {
  const { auth } = usePage<SharedData>().props;
  const [showPassword, setShowPassword] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
  });

  const isAuthError =
    errors.username?.includes('salah') || errors.password?.includes('salah');

  useEffect(() => {
    redirectIfAuthenticated({ auth });
  }, [auth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('login'), {
      onError: (errs) => {
        toast.error(Object.values(errs).join('\n'));
        reset('username', 'password');
      },
    });
  };

  return (
    <>
      <Head title="Masuk" />

      <div className="min-h-[100dvh] lg:grid lg:grid-cols-2 bg-background text-foreground">
        {/* Left institutional panel (desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between bg-[#162C49] p-12 text-[#F8F7F4] border-r border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 p-1.5 ring-1 ring-white/15">
              <img
                src="/logo.png"
                alt="Logo SIBULAN"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="block text-base font-semibold tracking-tight">
                SIBULAN
              </span>
              <span className="block text-xs text-white/70">
                Sistem Informasi Laporan Bulanan
              </span>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <div className="h-0.5 w-10 bg-white/30 rounded-full" />
            <h1 className="text-3xl font-medium tracking-tight leading-snug">
              Pengarsipan laporan bulanan yang tertib, terstruktur, dan mudah ditelusuri.
            </h1>
            <p className="text-sm leading-relaxed text-white/75">
              Kelola unggahan dokumen laporan tiap departemen, pantau rekap bulanan, dan akses arsip resmi dalam satu tempat.
            </p>
          </div>

          <p className="text-xs text-white/60 tabular-nums">
            &copy; {currentYear} SIBULAN
          </p>
        </aside>

        {/* Right form panel */}
        <div className="relative flex min-h-[100dvh] flex-col justify-between px-6 py-8 sm:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card p-1">
                <img
                  src="/logo.png"
                  alt="Logo SIBULAN"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                SIBULAN
              </span>
            </div>
            <div className="ml-auto">
              <AppearanceToggleDropdown />
            </div>
          </div>

          <main className="mx-auto w-full max-w-sm py-8">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Masuk ke SIBULAN
              </h2>
              <p className="text-sm text-muted-foreground">
                Masukkan username dan password akun Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Masukkan username"
                  value={data.username}
                  onChange={(e) => setData('username', e.target.value)}
                  aria-invalid={!!(errors.username || isAuthError)}
                  required
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    aria-invalid={!!(errors.password || isAuthError)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
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
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10"
                disabled={processing}
              >
                {processing ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </main>

          <footer className="text-center text-xs text-muted-foreground lg:hidden tabular-nums">
            &copy; {currentYear} SIBULAN
          </footer>
          <div className="hidden lg:block" />
        </div>
      </div>
    </>
  );
}
