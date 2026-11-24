import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

const APPEARANCE_OPTIONS: Array<{ value: Appearance; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
];

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />;
            case 'light':
                return <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />;
            default:
                return <Monitor className="h-[18px] w-[18px]" strokeWidth={1.5} />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                        aria-label="Ubah tema tampilan"
                    >
                        {getCurrentIcon()}
                        <span className="sr-only">Ubah tema tampilan</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    {APPEARANCE_OPTIONS.map(({ value, label, icon: Icon }) => {
                        const isActive = appearance === value;
                        return (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => updateAppearance(value)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                                    <span className={isActive ? 'font-medium text-foreground' : ''}>{label}</span>
                                </span>
                                {isActive && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2} />}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
