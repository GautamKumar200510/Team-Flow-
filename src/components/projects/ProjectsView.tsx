import React, { useState } from 'react';
import {
  FolderPlus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Project } from '../../types';

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onSelectProject,
  onOpenCreateProject,
}) => {
  const {
    projects,
    tasks,
    team,
    searchQuery,
    setSearchQuery,
    deleteProject,
    deleteAllProjects,
  } = useProject();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const filteredProjects = projects.filter((project) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = project.name.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchCat = project.category?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    if (statusFilter !== 'all' && project.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && project.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(projects.map((p) => p.category || 'General')));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your team's initiatives, deadlines, and delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {projects.length > 0 && (
            <button
              id="btn-projects-remove-all"
              onClick={() => setShowDeleteAllConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All</span>
            </button>
          )}

          <button
            id="btn-projects-create-new"
            onClick={onOpenCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors w-fit"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full text-xs sm:text-sm bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-6">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <FolderPlus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Projects Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6">
            All projects have been removed or no projects match your search filter.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateProject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Create New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const total = projectTasks.length;
            const completed = projectTasks.filter((t) => t.status === 'completed').length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const daysInfo = getDaysRemaining(project.deadline);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  {/* Top tags & delete button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md"
                        style={{
                          backgroundColor: `${project.color || '#4F46E5'}15`,
                          color: project.color || '#4F46E5',
                        }}
                      >
                        {project.category || 'General'}
                      </span>
                      <PriorityBadge priority={project.priority} size="sm" />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#4F46E5' }}
                    />
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {completed} of {total} tasks completed
                    </div>
                  </div>
                </div>

                {/* Card Footer: Members & Deadline */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center -space-x-1.5">
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
                    {daysInfo.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Single Project Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete Project"
        message={`Are you sure you want to remove "${projectToDelete?.name}"? All associated tasks and comments will be permanently deleted.`}
        confirmLabel="Delete Project"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (projectToDelete) {
            await deleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Delete All Projects Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        title="Remove All Projects"
        message="Are you sure you want to remove all projects? This will clear all current project cards and tasks."
        confirmLabel="Remove All"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          await deleteAllProjects();
          setShowDeleteAllConfirm(false);
        }}
        onCancel={() => setShowDeleteAllConfirm(false)}
      />
    </div>
  );
};
