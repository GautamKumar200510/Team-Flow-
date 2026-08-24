import React from 'react';
import { getInitials } from '../../lib/utils';
import { UserStatus } from '../../types';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatus;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base font-medium',
  xl: 'w-16 h-16 text-xl font-medium',
};

const dotSizes = {
  xs: 'w-1.5 h-1.5 ring-1',
  sm: 'w-2 h-2 ring-1.5',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3 h-3 ring-2',
  xl: 'w-4 h-4 ring-2',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-300',
  away: 'bg-amber-400',
  busy: 'bg-rose-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  status,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Deterministic bg color based on string hash
  const getBgColor = (str: string) => {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-purple-600 text-white',
      'bg-rose-600 text-white',
      'bg-cyan-600 text-white',
      'bg-teal-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center rounded-full select-none ${className}`}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-slate-200/80`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getBgColor(
            name
          )} rounded-full flex items-center justify-center font-medium tracking-tight shadow-inner`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${statusColors[status]} ${dotSizes[size]}`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
