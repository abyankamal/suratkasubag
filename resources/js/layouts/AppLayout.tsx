import { Link, router, Head } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Sidebar } from '@/components/Sidebar';
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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [currentYear] = useState(new Date().getFullYear());
    
    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            // Only close if sidebar is open and clicking outside of sidebar and hamburger button
            if (showMobileSidebar && !target.closest('#mobile-sidebar') && !target.closest('#mobile-menu-button')) {
                setShowMobileSidebar(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileSidebar]);
    
    // Protect dashboard routes - redirect to login if not authenticated
    useEffect(() => {
        redirectIfUnauthenticated({ auth });
    }, [auth.user]);

    // Don't render anything if not authenticated (will be redirected)
    if (!auth.user) {
        return null;
    }

    const toggleMobileSidebar = () => {
        setShowMobileSidebar(prevState => !prevState);
    };

    const closeMobileSidebar = () => {
        if (showMobileSidebar) {
            setShowMobileSidebar(false);
        }
    };

    const UserProfileDropdown = () => (
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
                <div>
                    <UserAvatar 
                        name={auth.user?.name || 'User'} 
                        className="h-9 w-9" 
                        imageSrc={auth.user?.avatar}
                    />
                </div>
                <div className="ml-3 overflow-hidden">
                    <div className="text-sm font-medium text-gray-700 truncate">
                        {auth.user?.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        @{auth.user?.username}
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* User dropdown menu */}
            {userMenuOpen && (
                <div className="absolute bottom-16 left-4 right-4 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
                    <Link
                        href={route('profile')}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                    >
                        Profil Saya
                    </Link>
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                        >
                            Keluar
                        </button>
                    </form>
                </div>
            )}
        </div>

);

    const MainContent = () => (
        <div className="flex flex-col flex-1 overflow-hidden">
            <header className="bg-white shadow-sm z-10">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            onClick={toggleMobileSidebar}
                            id="mobile-menu-button"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="ml-2 text-lg font-semibold text-gray-900 text-center">{header}</h1>
                    </div>
                    
                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            id="user-menu-button"
                            onClick={() => setUserMenuOpen(prev => !prev)}
                        >
                            <UserAvatar 
                                name={auth.user?.name || 'User'}
                                imageSrc={auth.user?.avatar}
                                className="h-8 w-8"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">
                                {auth.user?.name}
                            </span>
                            <svg 
                                className={`ml-1 h-5 w-5 text-gray-400 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {userMenuOpen && (
                            <div 
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabIndex={-1}
                            >
                                <Link
                                    href={route('profile')}
                                    className="block text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    Profil Saya
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex={-1}
                                >
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="text-sm text-gray-500 text-center w-full md:w-auto">
                        &copy; {currentYear} SIBULAN. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <Head title={header || 'SIBULAN'} />
            
            {/* Mobile sidebar backdrop */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}
            
            <div className="flex w-full">
                {/* Desktop sidebar */}
                <div className="hidden md:block md:flex-shrink-0 md:w-64">
                    <div className="flex flex-col h-full border-r border-gray-200 bg-white overflow-y-auto">
                        <div className="flex items-center justify-center flex-shrink-0 px-4 py-5">
                            <ApplicationLogo className="h-8" />
                        </div>
                        <div className="flex-1">
                            <Sidebar />
                        </div>
                    </div>
                </div>
                
                {/* Mobile sidebar */}
                <div className={`md:hidden fixed inset-y-0 flex flex-col z-50 ${showMobileSidebar ? 'left-0' : '-left-64'} transition-all duration-300 ease-in-out w-64`} id="mobile-sidebar">
                    <div className="flex flex-col flex-grow w-full border-r border-gray-200 bg-white overflow-y-auto">
                        <div className="flex items-center justify-center flex-shrink-0 px-4 py-5">
                            <ApplicationLogo className="h-8" />
                        </div>
                        <div className="flex-1">
                            <Sidebar />
                        </div>
                        <UserProfileDropdown />
                    </div>
                </div>
                
                {/* Main content */}
                <MainContent />
            </div>
        </div>
    );
}
