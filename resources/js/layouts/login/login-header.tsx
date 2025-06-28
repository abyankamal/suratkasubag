import { cn } from '@/lib/utils';

export default function LoginHeader() {
  return (
    <header className="w-full bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="SIBULAN Logo" 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                // Fallback if image doesn't load
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className={cn(
              "text-xl font-bold tracking-tight text-primary"
            )}>
              SIBULAN
            </h1>
            <p className="text-xs text-muted-foreground">
              Sistem Informasi Laporan Bulanan
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
