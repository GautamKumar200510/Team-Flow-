import React, { useState } from 'react';
import {
  Clock,
  MessageSquare,
  CheckSquare,
  MoreVertical,
  ArrowRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { Task, TaskStatus, User } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import { useProject } from '../../context/ProjectContext';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onOpenDetails: (taskId: string) => void;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  onOpenDetails,
  onMoveStatus,
}) => {
  const { deleteTask } = useProject();
  const [showMenu, setShowMenu] = useState(false);
  const daysInfo = getDaysRemaining(task.deadline);

  const completedChecklistCount = task.checklist.filter((item) => item.completed).length;
  const totalChecklistCount = task.checklist.length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const statusOptions: { label: string; value: TaskStatus }[] = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Review', value: 'review' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDetails(task.id)}
      className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group relative select-none"
    >
      {/* Priority Tag & Context Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} size="sm" />

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="Task actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-30 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Move to status
              </div>
              {statusOptions
                .filter((opt) => opt.value !== task.status)
                .map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setShowMenu(false);
                      onMoveStatus(task.id, opt.value);
                    }}
                    className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between transition-colors"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </button>
                ))}

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenDetails(task.id);
                }}
                className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                <span>View Details</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  deleteTask(task.id);
                }}
                className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5">
        {task.title}
      </h4>

      {/* Optional Description Preview */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{task.description}</p>
      )}

      {/* Tags if any */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Deadline, Checklist pill, Assignee */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {/* Deadline badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              daysInfo.isOverdue && task.status !== 'completed'
                ? 'text-red-500 font-semibold'
                : 'text-gray-500'
            }`}
            title={`Due: ${formatDate(task.deadline)}`}
          >
            <Clock className="w-3 h-3" />
            <span>{daysInfo.text}</span>
          </span>

          {/* Subtasks pill */}
          {totalChecklistCount > 0 && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
                completedChecklistCount === totalChecklistCount
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={`${completedChecklistCount} of ${totalChecklistCount} subtasks completed`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedChecklistCount}/{totalChecklistCount}
              </span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <Avatar
            name={assignee.name}
            avatarUrl={assignee.avatar}
            size="xs"
            status={assignee.status}
          />
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
            ?
          </div>
        )}
      </div>
    </div>
  );
};
