import React from 'react';
import { PriorityLevel, TaskStatus, ProjectStatus } from '../../types';
import { getPriorityBadge, getStatusBadge } from '../../lib/utils';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', size = 'md' }) => {
  const info = getPriorityBadge(priority);
  const sizeCls = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${info.bg} ${sizeCls} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      <span className="capitalize">{info.label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const info = getStatusBadge(status);
  const sizeCls = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${info.bg} ${sizeCls} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      <span>{info.label}</span>
    </span>
  );
};
