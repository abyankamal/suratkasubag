import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Users,
  Briefcase,
  Building2,
} from 'lucide-react';

interface MenuItemProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onNavigate?: () => void;
}

const MenuItem = ({ href, active, icon, children, onNavigate }: MenuItemProps) => (
  <Link
    href={href}
    onClick={onNavigate}
    className={cn(
      'relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-[color,background-color] duration-150 ease-out-quart',
      active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full before:bg-primary'
        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
    )}
  >
    <span
      className={cn(
        'flex w-5 shrink-0 items-center justify-center',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {icon}
    </span>
    <span className="truncate">{children}</span>
  </Link>
);

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { auth } = usePage<SharedData>().props;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const getPathname = (urlStr: string) => {
    try {
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.includes('://')) {
        return new URL(urlStr).pathname;
      }
    } catch {
      // fallback to raw urlStr
    }
    return urlStr;
  };

  const isActive = (urlStr: string, exact = false) => {
    const path = getPathname(urlStr);
    if (exact) {
      return currentPath === path;
    }
    return (
      currentPath === path ||
      (currentPath.startsWith(path) &&
        (currentPath[path.length] === '/' || currentPath.length === path.length))
    );
  };

  const isAdmin = auth?.user?.role === 'admin';

  return (
    <nav className="flex flex-col px-3 py-4" aria-label="Navigasi utama">
      <div className="mb-2 px-3 text-xs font-medium text-muted-foreground">
        Menu utama
      </div>
      <div className="space-y-1">
        <MenuItem
          href={route('dashboard')}
          active={isActive(route('dashboard'), true)}
          icon={<Home className="h-[18px] w-[18px]" strokeWidth={1.5} />}
          onNavigate={onNavigate}
        >
          Beranda
        </MenuItem>

        <MenuItem
          href={route('reports.index')}
          active={isActive(route('reports.index'))}
          icon={<FileText className="h-[18px] w-[18px]" strokeWidth={1.5} />}
          onNavigate={onNavigate}
        >
          {isAdmin ? 'Daftar Laporan' : 'Laporan Saya'}
        </MenuItem>
      </div>

      {isAdmin && (
        <>
          <div className="mt-6 mb-2 px-3 text-xs font-medium text-muted-foreground">
            Administrasi
          </div>
          <div className="space-y-1">
            <MenuItem
              href={route('users.index')}
              active={isActive(route('users.index'))}
              icon={<Users className="h-[18px] w-[18px]" strokeWidth={1.5} />}
              onNavigate={onNavigate}
            >
              Daftar Pengguna
            </MenuItem>

            <MenuItem
              href={route('departments.index')}
              active={isActive(route('departments.index'))}
              icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.5} />}
              onNavigate={onNavigate}
            >
              Daftar Departemen
            </MenuItem>

            <MenuItem
              href={route('positions.index')}
              active={isActive(route('positions.index'))}
              icon={<Briefcase className="h-[18px] w-[18px]" strokeWidth={1.5} />}
              onNavigate={onNavigate}
            >
              Daftar Posisi
            </MenuItem>
          </div>
        </>
      )}
    </nav>
  );
}
