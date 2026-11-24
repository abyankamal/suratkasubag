import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'SIBULAN';

function ThemeAwareToaster() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof document === 'undefined') {
            return 'light';
        }
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        const syncTheme = () => {
            setTheme(root.classList.contains('dark') ? 'dark' : 'light');
        };

        syncTheme();

        const observer = new MutationObserver(syncTheme);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <Toaster
            position="top-right"
            theme={theme}
            richColors
            toastOptions={{
                classNames: {
                    toast: 'bg-card text-card-foreground border border-border shadow-md rounded-lg font-sans text-sm',
                    description: 'text-muted-foreground text-xs',
                },
            }}
        />
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ThemeAwareToaster />
            </>
        );
    },
    progress: {
        color: '#1E3A5F',
    },
});

// Initialize light / dark mode on load
initializeTheme();
