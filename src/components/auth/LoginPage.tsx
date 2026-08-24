import React, { useState } from 'react';
import { Kanban, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignUp, onNavigateToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setFormError(err.message || 'Invalid email or password. Please try again or create an account.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="flex-1 py-2 text-center rounded-lg bg-white text-gray-900 shadow-2xs transition-all font-bold"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="flex-1 py-2 text-center rounded-lg text-gray-600 hover:text-gray-900 transition-all"
          >
            Create Account
          </button>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back to TeamFlow
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Enter your credentials or choose an instant demo profile
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
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email-input">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@teamflow.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="password-input">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure JWT authentication & bcrypt encrypted passwords</span>
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
