import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { SyntheticEvent } from 'react';

interface ApplicationLogoProps {
    className?: string;
}

export default function ApplicationLogo({ className = '' }: ApplicationLogoProps) {
    const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = window.location.origin + '/logo.svg';
        target.onerror = () => {
            target.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
        };
    };

    return (
        <Link href="/" className={cn('flex items-center gap-3 group', className)}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card p-1 shadow-sm">
                <img
                    src={window.location.origin + '/logo.png'}
                    alt="Logo SIBULAN"
                    className="h-full w-full object-contain"
                    onError={handleImageError}
                />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold tracking-tight text-foreground leading-none">
                    SIBULAN
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground leading-tight truncate">
                    Laporan Bulanan
                </span>
            </div>
        </Link>
    );
}
