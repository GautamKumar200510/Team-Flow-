import React, { useState } from 'react';
import { Kanban, Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, Briefcase, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding?: () => void;
}

const roleOptions: UserRole[] = [
  'Product Lead',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'UI/UX Designer',
  'Project Manager',
  'QA Engineer',
  'Member',
];

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToLogin, onNavigateToLanding }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Full-Stack Developer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordLongEnough = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand */}
        <div
          onClick={onNavigateToLanding}
          className="flex items-center justify-center gap-2.5 cursor-pointer group mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Kanban className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">TeamFlow</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-200/70 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="flex-1 py-2 text-center rounded-lg text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            className="flex-1 py-2 text-center rounded-lg bg-white text-gray-900 shadow-2xs transition-all font-bold"
          >
            Create Account
          </button>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900 tracking-tight">
          Create your TeamFlow account
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Get started with real-time task management and team workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-gray-200 rounded-2xl">
          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-email">
                Work or School Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-role">
                Primary Workspace Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="signup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checks */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                  <span className={`flex items-center gap-1 ${isPasswordLongEnough ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    <Check className="w-3 h-3" /> 6+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    <Check className="w-3 h-3" /> Letters
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    <Check className="w-3 h-3" /> Numbers
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-signup"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security details */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end encrypted session with immediate database persistence</span>
          </div>
        </div>

        {onNavigateToLanding && (
          <div className="text-center mt-5">
            <button
              onClick={onNavigateToLanding}
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              ← View TeamFlow Features Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
