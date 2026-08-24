import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, Eye, ListTodo } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { useProject } from '../../context/ProjectContext';

interface KanbanBoardProps {
  tasks: Task[];
  onOpenTaskDetails: (taskId: string) => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  badgeText: string;
}

const columns: ColumnConfig[] = [
  {
    id: 'todo',
    title: 'To Do',
    icon: ListTodo,
    color: 'border-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: Clock,
    color: 'border-indigo-300',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  {
    id: 'review',
    title: 'Review',
    icon: Eye,
    color: 'border-purple-300',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    color: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onOpenTaskDetails,
  onOpenCreateTask,
}) => {
  const { moveTask, team } = useProject();
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (colId: TaskStatus) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, colId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        const isDraggingOver = dragOverCol === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={() => handleDragLeave(column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col bg-gray-50/80 rounded-2xl border transition-colors min-h-[480px] p-3.5 ${
              isDraggingOver
                ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-400/20'
                : 'border-gray-200/80'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-bold text-gray-800 tracking-tight">{column.title}</h3>
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${column.badgeBg} ${column.badgeText}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateTask(column.id)}
                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shadow-2xs"
                title={`Add task to ${column.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task List in Column */}
            <div className="space-y-3 flex-1 overflow-y-auto min-h-[120px]">
              {columnTasks.length === 0 ? (
                <div
                  onClick={() => onOpenCreateTask(column.id)}
                  className="h-28 rounded-xl border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-white/60 flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-colors group"
                >
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 mb-1 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-indigo-600">
                    Add task
                  </span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const assignee = team.find((u) => u.id === task.assigneeId);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={assignee}
                      onOpenDetails={onOpenTaskDetails}
                      onMoveStatus={moveTask}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
