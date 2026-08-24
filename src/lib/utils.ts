import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PriorityLevel, TaskStatus, ProjectStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function isOverdue(dateString?: string, status?: TaskStatus): boolean {
  if (!dateString || status === 'completed') return false;
  return new Date(dateString).getTime() < new Date().getTime();
}

export function getDaysRemaining(dateString?: string): { days: number; text: string; isOverdue: boolean } {
  if (!dateString) return { days: 0, text: 'No date', isOverdue: false };
  const target = new Date(dateString);
  const today = new Date();
  // reset hours
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(target);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  }
  if (diffDays === 0) {
    return { days: 0, text: 'Due today', isOverdue: false };
  }
  if (diffDays === 1) {
    return { days: 1, text: 'Due tomorrow', isOverdue: false };
  }
  return { days: diffDays, text: `${diffDays}d left`, isOverdue: false };
}

export function getPriorityBadge(priority: PriorityLevel) {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'high':
      return {
        label: 'High',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'medium':
      return {
        label: 'Medium',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'low':
    default:
      return {
        label: 'Low',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getStatusBadge(status: TaskStatus | ProjectStatus) {
  switch (status) {
    case 'todo':
    case 'planning':
      return {
        label: status === 'todo' ? 'To Do' : 'Planning',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'in_progress':
    case 'active':
      return {
        label: status === 'in_progress' ? 'In Progress' : 'Active',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'review':
      return {
        label: 'In Review',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'on_hold':
      return {
        label: 'On Hold',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
