import { Link, router, Head } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { ChevronDown, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Sidebar } from '@/components/Sidebar';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { redirectIfUnauthenticated } from '@/middleware/AuthMiddleware';

interface User {
    id: number;
    name: string;
    username: string;
    role: 'admin' | 'user';
    avatar?: string;
}

interface AppLayoutProps {
    auth: {
        user: User | null;
    };
    header?: string;
    children: ReactNode;
}

export default function AppLayout({ auth, header, children }: AppLayoutProps) {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    useEffect(() => {
        redirectIfUnauthenticated({ auth });
    }, [auth.user]);

    if (!auth.user) {
        return null;
    }

    return (
        <div className="flex min-h-[100dvh] bg-background text-foreground">
            <Head title={header || 'SIBULAN'} />

            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-sidebar-border bg-sidebar">
                <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
                    <ApplicationLogo />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Sidebar />
                </div>
            </aside>

            {/* Mobile navigation drawer */}
            <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
                    <SheetHeader className="h-16 flex-row items-center border-b border-sidebar-border px-5 py-0">
                        <SheetTitle className="sr-only">Menu Navigasi SIBULAN</SheetTitle>
                        <ApplicationLogo />
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                        <Sidebar onNavigate={() => setShowMobileSidebar(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Main content column */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border bg-card/85 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="md:hidden shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowMobileSidebar(true)}
                                aria-label="Buka menu navigasi"
                            >
                                <Menu className="h-5 w-5" strokeWidth={1.5} />
                            </Button>
                            <h1 className="truncate text-base font-semibold text-foreground">
                                {header || 'SIBULAN'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <AppearanceToggleDropdown />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-accent"
                                        aria-label="Menu akun"
                                    >
                                        <UserAvatar
                                            name={auth.user.name || 'User'}
                                            imageSrc={auth.user.avatar}
                                            className="h-7 w-7"
                                        />
                                        <span className="hidden text-sm font-medium text-foreground md:inline">
                                            {auth.user.name}
                                        </span>
                                        <ChevronDown
                                            className="h-4 w-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{auth.user.username}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href={route('profile')} className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                                            <span>Profil Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={handleLogout}
                                        className="cursor-pointer flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                                        <span>Keluar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>

                <footer className="border-t border-border bg-card/50 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between text-xs text-muted-foreground">
                        <span>&copy; {currentYear} SIBULAN</span>
                        <span>Sistem Informasi Laporan Bulanan</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
