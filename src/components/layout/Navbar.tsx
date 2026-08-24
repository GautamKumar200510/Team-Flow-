import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, Menu, Radio, FolderPlus, CheckSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useProject } from '../../context/ProjectContext';
import { Avatar } from '../common/Avatar';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  onNavigateToNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenCreateProject,
  onOpenCreateTask,
  onNavigateToNotifications,
}) => {
  const { user } = useAuth();
  const { isConnected, activeOnlineCount } = useSocket();
  const { searchQuery, setSearchQuery, notifications, setSelectedProjectId, setSelectedTaskId } = useProject();

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tasks..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Right: Live Connection, Quick "+ New" Menu, Notifications, User */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Real-time Status Badge */}
        <div
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
          title={isConnected ? `Real-time Live Sync active (${activeOnlineCount} online)` : 'Reconnecting...'}
        >
          <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
          <span>{isConnected ? `Live Sync (${activeOnlineCount})` : 'Connecting'}</span>
        </div>

        {/* Quick Action Button */}
        <div className="relative" ref={newMenuRef}>
          <button
            id="btn-quick-new"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>

          {showNewMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenCreateTask();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenCreateProject();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-amber-600" />
                <span>Create Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onSelectProject={(projId) => {
              setSelectedProjectId(projId);
              setShowNotifications(false);
            }}
            onSelectTask={(taskId) => {
              setSelectedTaskId(taskId);
              setShowNotifications(false);
            }}
          />
        </div>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <Avatar name={user.name} avatarUrl={user.avatar} size="sm" status={user.status || 'online'} />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[120px]">{user.name}</div>
              <div className="text-[10px] text-gray-500 leading-tight truncate max-w-[120px]">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
