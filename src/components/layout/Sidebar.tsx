import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  Settings,
  LogOut,
  Kanban,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Avatar } from '../common/Avatar';

export type NavTab = 'dashboard' | 'projects' | 'my-tasks' | 'team' | 'notifications' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenCreateProject,
}) => {
  const { user, logout } = useAuth();
  const { notifications, projects, tasks, setSelectedProjectId } = useProject();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const myAssignedTasksCount = tasks.filter((t) => t.assigneeId === user?.id && t.status !== 'completed').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, badge: myAssignedTasksCount || undefined },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined, badgeColor: 'bg-indigo-600 text-white' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-gray-800 leading-none">TeamFlow</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id as NavTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          item.badgeColor || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Active Projects Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Projects
              </span>
              <button
                onClick={onOpenCreateProject}
                className="text-gray-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    onSelectTab('projects');
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#4F46E5' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        {user && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              <Avatar name={user.name} avatarUrl={user.avatar} size="sm" status={user.status || 'online'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{user.role}</p>
              </div>

              <button
                id="btn-sidebar-logout"
                onClick={logout}
                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
