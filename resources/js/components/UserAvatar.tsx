import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  imageSrc?: string;
  className?: string;
}

export function UserAvatar({ name, imageSrc, className }: UserAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-primary/15 bg-primary/10 text-primary',
        className
      )}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="aspect-square h-full w-full object-cover"
          width={36}
          height={36}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold tracking-wide">
          {initials || 'U'}
        </div>
      )}
    </div>
  );
}
