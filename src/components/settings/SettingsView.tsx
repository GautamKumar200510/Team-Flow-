import React, { useState } from 'react';
import {
  User as UserIcon,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';
import { UserRole } from '../../types';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'Full-Stack Developer');
  const [status, setStatus] = useState<'online' | 'busy' | 'away'>(user?.status || 'online');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, role, status, avatar });
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Manage your personal profile, availability status, and workspace preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>Profile Information</span>
          </h2>

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Avatar Profile</label>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={name || 'User'} avatarUrl={avatar} size="lg" status={status} />
              <div>
                <div className="text-xs text-gray-600 mb-2">Choose preset or enter custom image URL:</div>
                <div className="flex items-center gap-2 mb-2">
                  {avatarPresets.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(presetUrl)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                        avatar === presetUrl
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={presetUrl} alt="Avatar Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full max-w-sm text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role / Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Primary Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Product Lead">Product Lead</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Member">Member</option>
              </select>
            </div>

            {/* Online Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Availability Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="online">🟢 Online (Available)</option>
                <option value="busy">🔴 Busy (Do not disturb)</option>
                <option value="away">🟡 Away</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
