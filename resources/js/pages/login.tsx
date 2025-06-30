import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import LoginLayout from '@/layouts/login-layout';
import { redirectIfAuthenticated } from '@/middleware/AuthMiddleware';
import { type SharedData } from '@/types';

export default function Login() {
  const { auth } = usePage<SharedData>().props;
  const [showPassword, setShowPassword] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
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

    // Update greeting on mount
    updateGreeting();
    
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('login'));
  };

  return (
    <>
      <Head title="Login" />
      
      <LoginLayout>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">{greeting}</h2>
            <p className="text-sm text-muted-foreground">
              Silahkan masukan username dan password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukan Username"
                value={data.username}
                onChange={(e) => setData('username', e.target.value)}
                className={`w-full ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && (
                <p className="text-sm text-red-500">Username tidak valid</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukan Password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">Password tidak valid</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-white shadow-md border-collapse border-blue-500 bg-blue-500 hover:bg-blue-600"
              disabled={processing}
            >
              Sign In
            </Button>
          </form>
        </div>
      </LoginLayout>
    </>
  );
}
