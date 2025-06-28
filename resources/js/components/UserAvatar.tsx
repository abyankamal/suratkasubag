import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  imageSrc?: string;
  className?: string;
}

export function UserAvatar({ name, imageSrc, className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
    >
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={name}
          className="aspect-square h-full w-full object-cover"
          width={40}
          height={40}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
          {initials}
        </div>
      )}
    </div>
  );
}
