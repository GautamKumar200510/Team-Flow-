import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, CheckCheck, Clock, Trash2, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatTimeAgo } from '../../lib/utils';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onSelectTask,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useProject();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (notif: any) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    if (notif.taskId && onSelectTask) {
      onSelectTask(notif.taskId);
      onClose();
    } else if (notif.projectId && onSelectProject) {
      onSelectProject(notif.projectId);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-12">
        {/* Mobile backdrop */}
        <div className="fixed inset-0 bg-slate-900/20 sm:hidden" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="relative sm:w-96 w-full max-h-[85vh] sm:max-h-[500px] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden m-2 sm:m-0"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">We'll alert you on task and project updates.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !notif.read ? 'bg-blue-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(notif.id);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
