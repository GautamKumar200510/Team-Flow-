import React from 'react';
import {
  FolderKanban,
  FolderPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  MessageSquare,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { formatDate, formatTimeAgo, getDaysRemaining } from '../../lib/utils';
import { Task, Project } from '../../types';

interface DashboardViewProps {
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
  onSelectProject: (projectId: string) => void;
  onSelectTask: (taskId: string) => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToProjects,
  onNavigateToTasks,
  onSelectProject,
  onSelectTask,
  onOpenCreateProject,
  onOpenCreateTask,
}) => {
  const { user } = useAuth();
  const { projects, tasks, activities, dashboardStats, moveTask, team } = useProject();

  // Helper to calculate project progress %
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  // Upcoming non-completed tasks sorted by deadline
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const stats = dashboardStats || {
    totalProjects: projects.length,
    activeTasks: tasks.filter((t) => t.status !== 'completed').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    overdueTasks: tasks.filter((t) => t.status !== 'completed' && new Date(t.deadline) < new Date()).length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) : 0,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name.split(' ')[0] || 'Team Member'}
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Here is what's happening across your team's projects today. You have{' '}
            <span className="font-semibold text-white">{stats.activeTasks} active tasks</span> in progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-dash-create-task"
            onClick={onOpenCreateTask}
            className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
          <button
            id="btn-dash-create-project"
            onClick={onOpenCreateProject}
            className="px-4 py-2.5 bg-indigo-700/80 hover:bg-indigo-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 border border-indigo-400/40"
          >
            <FolderKanban className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Projects + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Projects & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Projects Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800">Recent Projects</h2>
                <p className="text-xs text-gray-500">Active project boards and delivery progress</p>
              </div>
              <button
                onClick={onNavigateToProjects}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {projects.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">No Active Projects</h4>
                  <p className="text-[11px] text-gray-400 max-w-xs mb-3">
                    Create your first project to start organizing tasks, deadlines, and team members.
                  </p>
                  <button
                    onClick={onOpenCreateProject}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                projects.slice(0, 4).map((project) => {
                const { total, completed, percent } = getProjectStats(project.id);
                const daysInfo = getDaysRemaining(project.deadline);

                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="p-4 rounded-xl border border-gray-200/80 hover:border-indigo-300 hover:bg-gray-50/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-md shrink-0"
                          style={{ backgroundColor: project.color || '#4F46E5' }}
                        />
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={project.priority} size="sm" />
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 mb-3">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {completed} of {total} tasks completed
                        </span>
                        <span className="font-medium text-gray-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {project.members.map((memberId) => {
                          const m = team.find((u) => u.id === memberId);
                          if (!m) return null;
                          return (
                            <Avatar
                              key={memberId}
                              name={m.name}
                              avatarUrl={m.avatar}
                              size="xs"
                              className="ring-2 ring-white"
                            />
                          );
                        })}
                      </div>

                      <span
                        className={`text-[11px] font-medium ${
                          daysInfo.isOverdue ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        {daysInfo.text} ({formatDate(project.deadline)})
                      </span>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Upcoming Tasks Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-800">Upcoming Tasks</h2>
                <p className="text-xs text-gray-500">Tasks requiring completion across the team</p>
              </div>
              <button
                onClick={onNavigateToTasks}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">No upcoming active tasks.</div>
              ) : (
                upcomingTasks.map((task) => {
                  const assignee = team.find((u) => u.id === task.assigneeId);
                  const project = projects.find((p) => p.id === task.projectId);
                  const daysInfo = getDaysRemaining(task.deadline);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="p-3 rounded-xl border border-gray-200/80 hover:border-indigo-300 hover:bg-gray-50/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Quick complete toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveTask(task.id, 'completed');
                          }}
                          className="w-5 h-5 rounded-lg border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0"
                          title="Mark as completed"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-gray-800 group-hover:text-indigo-600 truncate transition-colors">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                            <span className="truncate max-w-[120px]">{project?.name || 'Project'}</span>
                            <span>•</span>
                            <span className={daysInfo.isOverdue ? 'text-red-500 font-semibold' : ''}>
                              {daysInfo.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={task.priority} size="sm" />
                        {assignee && (
                          <Avatar
                            name={assignee.name}
                            avatarUrl={assignee.avatar}
                            size="xs"
                            status={assignee.status}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Recent Activity</h2>
              <p className="text-xs text-gray-500">Real-time team updates & changes</p>
            </div>

            <div className="p-5 space-y-4 flex-1">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  No recent activity yet. Updates and changes will appear here in real-time.
                </div>
              ) : (
                activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                      {activity.user?.name ? activity.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'TM'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold text-gray-900">
                          {activity.user?.name || 'Team Member'}
                        </span>{' '}
                        <span className="text-gray-600">{activity.details}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-b-2xl flex items-center justify-center border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500">
                Working with {team.length} team member{team.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
