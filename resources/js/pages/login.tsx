import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { redirectIfAuthenticated } from '@/middleware/AuthMiddleware';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';

export default function Login() {
  const { auth } = usePage<SharedData>().props;
  const [showPassword, setShowPassword] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    redirectIfAuthenticated({ auth });
  }, [auth]);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 11) {
        setGreeting('Selamat Pagi');
      } else if (hour < 15) {
        setGreeting('Selamat Siang');
      } else if (hour < 19) {
        setGreeting('Selamat Sore');
      } else {
        setGreeting('Selamat Malam');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('login'), {
      onError: (errors) => {
        toast.error(Object.values(errors).join('\n'));
        reset('username', 'password');
      },
    });
  };

  return (
    <>
      <Toaster position="top-right" />
      <Head title="Login" />

      <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/login_bg.png')",
          }}
        >
          {/* Overlay to ensure text readability if needed */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Header - Recreating LoginHeader content */}
        <header className="relative z-10 w-full p-4 mb-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                <img
                  src="/logo.png"
                  alt="SIBULAN Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
                  }}
                />
              </div>
              <div className="flex flex-col drop-shadow-md">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SIBULAN
                </h1>
                <p className="text-xs text-blue-100">
                  Sistem Informasi Laporan Bulanan
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl overflow-hidden relative">

            {/* Glossy highlight effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">{greeting}</h2>
                <p className="text-sm text-blue-100">
                  Silahkan masukan username dan password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-50">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukan Username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    className={`bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:bg-black/30 w-full pr-10 ${errors.username ? 'border-red-400 focus:ring-red-400' : 'focus-visible:ring-blue-400 focus-visible:border-blue-400'}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-50">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukan Password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={`bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:bg-black/30 w-full pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : 'focus-visible:ring-blue-400 focus-visible:border-blue-400'}`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-white/60 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white bg-blue-600/90 hover:bg-blue-600 border border-transparent shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all duration-300 h-10 font-semibold"
                  disabled={processing}
                >
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer - Recreating LoginFooter content */}
        <footer className="relative z-10 w-full py-6 mt-4 text-center text-sm text-white/60">
          <div className="container mx-auto px-4">
            © {currentYear} SIBULAN.
          </div>
        </footer>
      </div>
    </>
  );
}
