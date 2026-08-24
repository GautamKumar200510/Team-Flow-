import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  User as UserIcon,
  CheckSquare,
  MessageSquare,
  History,
  Trash2,
  Send,
  Plus,
  Calendar,
  AlertCircle,
  Tag,
  FolderKanban
} from 'lucide-react';
import { Task, TaskStatus, PriorityLevel, Comment, ActivityLog } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { formatDate, formatTimeAgo } from '../../lib/utils';
import { ProgressBar } from '../common/ProgressBar';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { user } = useAuth();
  const {
    tasks,
    projects,
    team,
    updateTask,
    deleteTask,
    addComment,
    deleteComment,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [taskComments, setTaskComments] = useState<Comment[]>([]);
  const [taskActivities, setTaskActivities] = useState<ActivityLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Editable local state
  const currentTask = tasks.find((t) => t.id === taskId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description);
      setStatus(currentTask.status);
      setPriority(currentTask.priority);
      setAssigneeId(currentTask.assigneeId || '');
      setDeadline(currentTask.deadline ? currentTask.deadline.split('T')[0] : '');
    }
  }, [currentTask]);

  // Load comments and activities for task
  useEffect(() => {
    if (!taskId) return;

    async function loadTaskMeta() {
      try {
        const commRes = await api.getComments(taskId!);
        setTaskComments(commRes.comments);

        const actRes = await api.getActivities(20);
        setTaskActivities(actRes.activities.filter((a) => a.taskId === taskId));
      } catch (err) {
        console.error('Failed to load comments/activities:', err);
      }
    }

    loadTaskMeta();
  }, [taskId]);

  if (!taskId || !currentTask) return null;

  const project = projects.find((p) => p.id === currentTask.projectId);
  const assignee = team.find((u) => u.id === currentTask.assigneeId);

  const completedChecklist = currentTask.checklist.filter((i) => i.completed).length;
  const totalChecklist = currentTask.checklist.length;
  const checklistPercent = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  const handleFieldBlur = (field: keyof Task, value: any) => {
    if (!currentTask) return;
    updateTask(currentTask.id, { [field]: value });
  };

  const handleToggleChecklist = (itemId: string) => {
    const updated = currentTask.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateTask(currentTask.id, { checklist: updated });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };

    const updated = [...currentTask.checklist, newItem];
    updateTask(currentTask.id, { checklist: updated });
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (itemId: string) => {
    const updated = currentTask.checklist.filter((i) => i.id !== itemId);
    updateTask(currentTask.id, { checklist: updated });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addComment(currentTask.id, newComment.trim());
      setNewComment('');
      // Reload comments
      const commRes = await api.getComments(currentTask.id);
      setTaskComments(commRes.comments);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-gray-700">{project?.name || 'Project'}</span>
                <span>•</span>
                <span>Task #{currentTask.id.replace('tsk-', '')}</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleFieldBlur('title', title)}
                className="w-full text-base sm:text-lg font-bold text-gray-900 bg-transparent hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded-lg border border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-hidden transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  deleteTask(currentTask.id);
                  onClose();
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-5 border-b border-gray-100 gap-6 bg-white text-xs font-semibold">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Details & Subtasks</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments ({taskComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Activity History</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {activeTab === 'details' && (
              <>
                {/* Meta Control Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200/70 text-xs">
                  {/* Status */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => {
                        const newStatus = e.target.value as TaskStatus;
                        setStatus(newStatus);
                        handleFieldBlur('status', newStatus);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => {
                        const newPriority = e.target.value as PriorityLevel;
                        setPriority(newPriority);
                        handleFieldBlur('priority', newPriority);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Assignee</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => {
                        setAssigneeId(e.target.value);
                        handleFieldBlur('assigneeId', e.target.value || undefined);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Unassigned</option>
                      {team.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        handleFieldBlur('deadline', e.target.value ? new Date(e.target.value).toISOString() : '');
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleFieldBlur('description', description)}
                    placeholder="Add detailed task instructions, scope, or references..."
                    className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>

                {/* Checklist Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-800">Subtask Checklist</span>
                    </div>
                    {totalChecklist > 0 && (
                      <span className="text-xs font-medium text-gray-500">
                        {completedChecklist} of {totalChecklist} completed ({Math.round(checklistPercent)}%)
                      </span>
                    )}
                  </div>

                  {totalChecklist > 0 && (
                    <div className="mb-3">
                      <ProgressBar value={checklistPercent} size="sm" color="bg-emerald-600" />
                    </div>
                  )}

                  {/* Checklist Items List */}
                  <div className="space-y-2 mb-3">
                    {currentTask.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklist(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span
                            className={`text-xs ${
                              item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>

                        <button
                          onClick={() => handleRemoveChecklist(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Checklist Input */}
                  <form onSubmit={handleAddChecklist} className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Add subtask item..."
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistText.trim()}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Comments Thread Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-5">
                {/* List of comments */}
                <div className="space-y-4">
                  {taskComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-medium text-gray-600">No comments on this task yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Start the conversation with your team.</p>
                    </div>
                  ) : (
                    taskComments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                        <Avatar
                          name={comment.author?.name || 'User'}
                          avatarUrl={comment.author?.avatar}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">
                                {comment.author?.name || 'Team Member'}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>

                            {user?.id === comment.userId && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handlePostComment} className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <Avatar name={user?.name || 'Me'} avatarUrl={user?.avatar} size="sm" />
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment or mention an update..."
                      className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Activity History Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {taskActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No recorded activities for this task.
                  </div>
                ) : (
                  taskActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs">
                      <Avatar name={act.user?.name || 'User'} avatarUrl={act.user?.avatar} size="xs" />
                      <div className="flex-1">
                        <p className="text-gray-700">
                          <span className="font-semibold text-gray-900">{act.user?.name || 'User'}</span>{' '}
                          {act.details}
                        </p>
                        <span className="text-[10px] text-gray-400">{formatTimeAgo(act.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
