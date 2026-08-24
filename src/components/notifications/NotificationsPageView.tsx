import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Clock, Check, Inbox } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatTimeAgo } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';

interface NotificationsPageViewProps {
  onSelectProject: (projectId: string) => void;
  onSelectTask: (taskId: string) => void;
}

export const NotificationsPageView: React.FC<NotificationsPageViewProps> = ({
  onSelectProject,
  onSelectTask,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useProject();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (notif: any) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    if (notif.taskId) {
      onSelectTask(notif.taskId);
    } else if (notif.projectId) {
      onSelectProject(notif.projectId);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Stay updated with task assignments, project changes, and team comments.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors w-fit"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs w-fit text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-indigo-50 text-indigo-600 font-bold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            filter === 'unread'
              ? 'bg-indigo-50 text-indigo-600 font-bold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You have no notifications matching this view filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                !notif.read ? 'bg-indigo-50/20' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    !notif.read ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-gray-300'
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">{notif.title}</h3>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(notif.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
