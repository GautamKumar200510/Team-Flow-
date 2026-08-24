import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Clock,
  Check,
  Plus,
  ArrowRight,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskStatus, PriorityLevel } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';

interface MyTasksViewProps {
  onOpenTaskDetails: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onSelectProject: (projectId: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  onOpenTaskDetails,
  onOpenCreateTask,
  onSelectProject,
}) => {
  const { user } = useAuth();
  const { tasks, projects, team, moveTask, searchQuery, setSearchQuery } = useProject();

  const [scope, setScope] = useState<'assigned' | 'created' | 'all'>('assigned');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    // Scope filter
    if (scope === 'assigned' && t.assigneeId !== user?.id) return false;
    if (scope === 'created' && t.creatorId !== user?.id) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Status & Priority
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Keep track of your assignments, priorities, and upcoming deliverables.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Scope Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Scope Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setScope('assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'assigned'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assigned to Me ({tasks.filter((t) => t.assigneeId === user?.id).length})
            </button>
            <button
              onClick={() => setScope('created')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'created'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Created by Me ({tasks.filter((t) => t.creatorId === user?.id).length})
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'all'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Workspace Tasks ({tasks.length})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Secondary filters */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description="You have no tasks matching this view criteria."
          actionLabel="Create a Task"
          onAction={onOpenCreateTask}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const assignee = team.find((u) => u.id === task.assigneeId);
            const daysInfo = getDaysRemaining(task.deadline);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskDetails(task.id)}
                className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isDone
                    ? 'border-gray-200/60 bg-gray-50/40 opacity-75'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Quick Toggle Done */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.id, isDone ? 'todo' : 'completed');
                    }}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-xs sm:text-sm font-semibold transition-colors truncate ${
                          isDone
                            ? 'line-through text-gray-400'
                            : 'text-gray-800 group-hover:text-indigo-600'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-500">
                      {project && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(project.id);
                          }}
                          className="hover:text-indigo-600 font-medium flex items-center gap-1"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project.color || '#4F46E5' }}
                          />
                          <span>{project.name}</span>
                        </button>
                      )}

                      <span>•</span>

                      <span
                        className={
                          daysInfo.isOverdue && !isDone
                            ? 'text-red-500 font-semibold flex items-center gap-1'
                            : 'flex items-center gap-1'
                        }
                      >
                        <Clock className="w-3 h-3" />
                        <span>{daysInfo.text} ({formatDate(task.deadline)})</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <PriorityBadge priority={task.priority} size="sm" />
                  <StatusBadge status={task.status} size="sm" />

                  {assignee && (
                    <Avatar
                      name={assignee.name}
                      avatarUrl={assignee.avatar}
                      size="sm"
                      status={assignee.status}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
