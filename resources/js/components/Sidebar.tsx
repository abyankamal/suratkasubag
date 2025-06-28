import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Home as HomeIcon,
  FileText as FileTextIcon,
  Users as UsersIcon,
  FileBox as FileBoxIcon,
  Briefcase as BriefcaseIcon,
  Building2 as Building2Icon
} from 'lucide-react';

interface MenuItemProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const MenuItem = ({ href, active, icon, children }: MenuItemProps) => (
  <Link
    href={href}
    className={cn(
      'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
      active 
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-semibold' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    )}
  >
    <span className={cn(
      'w-6 h-6 mr-3 flex items-center justify-center rounded-lg',
      active 
        ? 'bg-blue-100 text-blue-700' 
        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
    )}>
      {icon}
    </span>
    <span className="flex-1">
      {children}
    </span>
    {active && (
      <span className="ml-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
    )}
  </Link>
);

export function Sidebar() {
  const { auth } = usePage<SharedData>().props;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Enhanced isActive function to handle exact and nested routes
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return currentPath === path;
    }
    // For nested routes, check if current path starts with the menu path
    // but not when it's just a partial match (e.g., /positions shouldn't match /position)
    return currentPath === path || 
           (currentPath.startsWith(path) && 
            (currentPath[path.length] === '/' || currentPath.length === path.length));
  };
  
  // Helper function to determine if any of the child routes are active
  const isChildActive = (path: string) => {
    return currentPath !== path && currentPath.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white h-screen shadow-md fixed">
      <div className="p-4">
        <nav className="space-y-2">
          {/* Beranda */}
          <MenuItem
            href={route('dashboard')}
            active={isActive(route('dashboard'), true)}
            icon={<HomeIcon className="w-5 h-5" />}
          >
            Beranda
          </MenuItem>

          {auth.user.role === 'admin' && (
            <>
              {/* Daftar Laporan */}
              <div className={cn('space-y-1', {
                'border-l-2 border-blue-500 pl-3 -ml-1': isChildActive(route('reports.index'))
              })}>
                <MenuItem
                  href={route('reports.index')}
                  active={isActive(route('reports.index')) || isChildActive(route('reports.index'))}
                  icon={<FileTextIcon className="w-5 h-5" />}
                >
                  Daftar Laporan
                </MenuItem>
              </div>

              {/* Daftar User */}
              <div className={cn('space-y-1', {
                'border-l-2 border-blue-500 pl-3 -ml-1': isChildActive(route('users.index'))
              })}>
                <MenuItem
                  href={route('users.index')}
                  active={isActive(route('users.index')) || isChildActive(route('users.index'))}
                  icon={<UsersIcon className="w-5 h-5" />}
                >
                  Daftar User
                </MenuItem>
              </div>

              {/* Daftar Kantor */}
              <div className={cn('space-y-1', {
                'border-l-2 border-blue-500 pl-3 -ml-1': isChildActive(route('departments.index'))
              })}>
                <MenuItem
                  href={route('departments.index')}
                  active={isActive(route('departments.index')) || isChildActive(route('departments.index'))}
                  icon={<Building2Icon className="w-5 h-5" />}
                >
                  Daftar Kantor
                </MenuItem>
              </div>

              {/* Daftar Posisi */}
              <div className={cn('space-y-1', {
                'border-l-2 border-blue-500 pl-3 -ml-1': isChildActive(route('positions.index'))
              })}>
                <MenuItem
                  href={route('positions.index')}
                  active={isActive(route('positions.index')) || isChildActive(route('positions.index'))}
                  icon={<BriefcaseIcon className="w-5 h-5" />}
                >
                  Daftar Posisi
                </MenuItem>
              </div>
            </>
          )}

          {auth.user.role === 'user' && (
            /* Laporan Saya */
            <div className={cn('space-y-1', {
              'border-l-2 border-blue-500 pl-3 -ml-1': isChildActive(route('reports.index'))
            })}>
              <MenuItem
                  href={route('reports.index')}
                  active={isActive(route('reports.index')) || isChildActive(route('reports.index'))}
                  icon={<FileTextIcon className="w-5 h-5" />}
                >
                Laporan Saya
              </MenuItem>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
