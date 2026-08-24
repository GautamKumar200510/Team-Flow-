import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FolderPlus, Plus, Loader2 } from 'lucide-react';
import { PriorityLevel } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorPalette = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Cyan', hex: '#06B6D4' },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { team, createProject } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('Engineering');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(user ? [user.id] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        priority,
        category,
        deadline: new Date(deadline).toISOString(),
        color: selectedColor,
        members: selectedMembers,
      });

      onClose();
      // Reset
      setName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6 z-10"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderPlus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Create New Project</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile App Redesign v2"
                required
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline the core deliverables and objectives..."
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Deadline & Color Theme */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Color Tag</label>
                <div className="flex items-center gap-2 pt-1.5">
                  {colorPalette.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        selectedColor === c.hex ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Team Members Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Assign Initial Team Members
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                {team.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`p-2 rounded-lg text-left text-xs border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100/60'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="truncate">{member.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
