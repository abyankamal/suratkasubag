import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Lock, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User as BaseUser } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { UserAvatar } from '@/components/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ChangePasswordForm from './ChangePasswordForm';

interface User extends BaseUser {
  username: string;
  department?: {
    id: number;
    name: string;
  } | null;
  avatar?: string;
}

export default function ProfilePage() {
  const { user, auth } = usePage<{ user: User; auth: { user: any } }>().props;
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  if (!user) {
    return (
      <AppLayout auth={auth} header="Profil Saya">
        <Head title="Profil Saya" />
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Gagal memuat data profil. Silakan muat ulang halaman.
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout auth={auth} header="Profil Saya">
      <Head title="Profil Saya" />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header summary */}
        <div className="surface-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={user.name}
                imageSrc={user.avatar}
                className="h-14 w-14 text-base"
              />
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {user.name}
                </h2>
                <p className="font-mono text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <Badge variant={user.role === 'admin' ? 'success' : 'secondary'}>
              {user.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
          </div>
        </div>

        {/* Account info */}
        <div className="surface-card p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
            <UserIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-foreground">
              Informasi Pengguna
            </h3>
          </div>

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Nama lengkap
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {user.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Username
              </dt>
              <dd className="mt-1 font-mono text-sm text-foreground">
                @{user.username}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Role
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground capitalize">
                {user.role}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Departemen
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {user.department?.name || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Security */}
        <div className="surface-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-foreground">
                  Keamanan Akun
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gunakan kata sandi yang kuat dan perbarui secara berkala untuk menjaga keamanan akun.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingPassword(true)}
              className="self-start sm:self-auto shrink-0"
            >
              <Lock className="h-4 w-4" strokeWidth={1.5} />
              <span>Ubah Password</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isEditingPassword} onOpenChange={setIsEditingPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span>Ubah Password</span>
            </DialogTitle>
            <DialogDescription>
              Masukkan password saat ini dan password baru untuk akun Anda.
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm onCancel={() => setIsEditingPassword(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
