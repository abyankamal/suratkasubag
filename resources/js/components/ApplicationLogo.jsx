import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function ApplicationLogo({ className = '' }) {
    return (
        <Link href="/" className={cn("flex items-center", className)}>
            <div className="flex-shrink-0">
                <img 
                    src={window.location.origin + '/logo.png'} 
                    alt="SIBULAN Logo" 
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                        // Fallback if image doesn't load
                        const target = e.target;
                        target.src = window.location.origin + '/logo.svg';
                        target.onerror = () => {
                            target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
                        };
                    }}
                />
            </div>
            <div className="flex flex-col ml-3">
                <h1 className="text-xl font-bold tracking-tight text-primary">
                    SIBULAN
                </h1>
                <p className="text-xs text-muted-foreground">
                    Sistem Informasi Laporan Bulanan
                </p>
            </div>
        </Link>
    );
}
