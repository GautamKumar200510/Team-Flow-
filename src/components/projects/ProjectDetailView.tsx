import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Kanban,
  List,
  BarChart3,
  Users,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Project, TaskStatus, PriorityLevel } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onOpenTaskDetails: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onOpenTaskDetails,
  onOpenCreateTask,
}) => {
  const {
    projects,
    tasks,
    team,
    deleteProject,
    updateProject,
    moveTask,
    searchQuery,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'analytics'>('kanban');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Project Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This project may have been deleted or moved.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Apply in-project filters
  const filteredTasks = projectTasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = projectTasks.filter((t) => t.status === 'todo').length;
  const reviewTasks = projectTasks.filter((t) => t.status === 'review').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const daysInfo = getDaysRemaining(project.deadline);

  const handleToggleMember = (memberId: string) => {
    const isMember = project.members.includes(memberId);
    const newMembers = isMember
      ? project.members.filter((id) => id !== memberId)
      : [...project.members, memberId];
    updateProject(project.id, { members: newMembers });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & top navigation row */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateTask('todo')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color || '#4F46E5' }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {project.name}
              </h1>
              <StatusBadge status={project.status} size="sm" />
              <PriorityBadge priority={project.priority} size="sm" />
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{project.description}</p>
          </div>

          {/* Progress & Deadline Summary */}
          <div className="flex flex-col sm:flex-row lg:flex-col justify-end gap-4 min-w-[240px]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-medium">Project Progress</span>
                <span className="font-bold text-gray-900">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>{completedTasks} completed</span>
                <span>{totalTasks} total tasks</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Deadline:</span>
              </span>
              <span
                className={`font-semibold ${
                  daysInfo.isOverdue ? 'text-red-500' : 'text-gray-700'
                }`}
              >
                {formatDate(project.deadline)} ({daysInfo.text})
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Team Members Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>Project Team:</span>
            </span>

            <div className="flex items-center -space-x-1.5">
              {project.members.map((memberId) => {
                const m = team.find((u) => u.id === memberId);
                if (!m) return null;
                return (
                  <Avatar
                    key={memberId}
                    name={m.name}
                    avatarUrl={m.avatar}
                    size="sm"
                    status={m.status}
                    className="ring-2 ring-white"
                  />
                );
              })}
            </div>

            {/* Manage Members Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowMemberPicker(!showMemberPicker)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors text-xs flex items-center gap-1"
                title="Manage Team Members"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Manage</span>
              </button>

              {showMemberPicker && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-30">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                    Assign / Unassign Team
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {team.map((m) => {
                      const isAssigned = project.members.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMember(m.id)}
                          className={`w-full p-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                            isAssigned
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Avatar name={m.name} avatarUrl={m.avatar} size="xs" />
                            <span className="truncate">{m.name}</span>
                          </div>
                          <span className="text-xs">{isAssigned ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Tag */}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
            {project.category || 'General'}
          </span>
        </div>
      </div>

      {/* Tab Controls and View Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs: Kanban vs List vs Analytics */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kanban'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Assignee filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Assignees</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Kanban Board View */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          tasks={filteredTasks}
          onOpenTaskDetails={onOpenTaskDetails}
          onOpenCreateTask={onOpenCreateTask}
        />
      )}

      {/* Tab 2: Table / List View */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No tasks found for the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const assignee = team.find((u) => u.id === t.assigneeId);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onOpenTaskDetails(t.id)}
                        className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-gray-800">
                          {t.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={t.priority} size="sm" />
                        </td>
                        <td className="py-3.5 px-4">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={assignee.name} avatarUrl={assignee.avatar} size="xs" />
                              <span className="text-gray-700">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{formatDate(t.deadline)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTaskDetails(t.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Insights & Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Task Status Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">To Do</span>
                  <span className="font-semibold text-gray-800">{todoTasks}</span>
                </div>
                <ProgressBar value={totalTasks ? (todoTasks / totalTasks) * 100 : 0} color="bg-gray-400" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold text-gray-800">{inProgressTasks}</span>
                </div>
                <ProgressBar value={totalTasks ? (inProgressTasks / totalTasks) * 100 : 0} color="bg-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Review</span>
                  <span className="font-semibold text-gray-800">{reviewTasks}</span>
                </div>
                <ProgressBar value={totalTasks ? (reviewTasks / totalTasks) * 100 : 0} color="bg-purple-600" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-800">{completedTasks}</span>
                </div>
                <ProgressBar value={totalTasks ? (completedTasks / totalTasks) * 100 : 0} color="bg-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Team Workload on this Project</h3>
            <div className="space-y-3">
              {project.members.map((mId) => {
                const member = team.find((u) => u.id === mId);
                if (!member) return null;
                const memberTasks = projectTasks.filter((t) => t.assigneeId === mId);
                const memberCompleted = memberTasks.filter((t) => t.status === 'completed').length;
                return (
                  <div key={mId} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200/60">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} avatarUrl={member.avatar} size="sm" />
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{member.name}</div>
                        <div className="text-[10px] text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">{memberTasks.length} tasks</span>
                      <div className="text-[10px] text-emerald-600 font-medium">{memberCompleted} done</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks and comments will be permanently removed.`}
        confirmLabel="Delete Project"
        isDanger={true}
        onConfirm={() => {
          deleteProject(project.id);
          setShowDeleteConfirm(false);
          onBack();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
