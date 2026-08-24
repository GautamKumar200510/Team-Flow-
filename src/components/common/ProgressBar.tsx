import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'bg-indigo-600',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
