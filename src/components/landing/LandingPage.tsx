import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Kanban,
  Zap,
  MessageSquare,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  const { demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Kanban className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TeamFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#teams" className="hover:text-indigo-600 transition-colors">For Teams</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              id="btn-nav-login"
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              id="btn-nav-signup"
              onClick={onNavigateToSignUp}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Project Management for Small Teams & Startups</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
            Plan. Collaborate. <br />
            <span className="text-indigo-600">Get Things Done.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            TeamFlow gives small teams, students, and startups an intuitive workspace to create projects, assign tasks on real-time Kanban boards, communicate in comments, and ship with confidence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="btn-hero-signup"
              onClick={onNavigateToSignUp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Get Started with TeamFlow</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-demo"
              onClick={() => demoLogin('alex@teamflow.com')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 active:bg-gray-300 rounded-xl transition-all cursor-pointer"
            >
              <Laptop className="w-4 h-4 text-indigo-600" />
              <span>Explore Live Demo (1-Click)</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No complex onboarding
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time WebSocket sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free demo accounts
            </span>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 rounded-2xl border border-gray-200 bg-gray-50/50 p-2 sm:p-4 shadow-xl max-w-5xl mx-auto"
        >
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            {/* Mock Header */}
            <div className="h-11 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-gray-600">TeamFlow Workspace • Live Project Board</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Syncing
                </span>
              </div>
            </div>

            {/* Mock Kanban Preview */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/40">
              {/* Col 1 */}
              <div className="bg-gray-100/70 p-3 rounded-xl border border-gray-200/60">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-700">
                  <span>To Do</span>
                  <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[11px] font-medium">2</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Medium</span>
                    <h4 className="text-xs font-semibold text-gray-800 mt-1.5">Accessibility WCAG Audit</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" /> 7d left</span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">SC</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="bg-gray-100/70 p-3 rounded-xl border border-gray-200/60">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-700">
                  <span>In Progress</span>
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[11px] font-medium">2</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Urgent</span>
                    <h4 className="text-xs font-semibold text-gray-800 mt-1.5">Drag-and-Drop Column Transitions</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-gray-400" /> 3 comments</span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">AJ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3 */}
              <div className="bg-gray-100/70 p-3 rounded-xl border border-gray-200/60">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-700">
                  <span>Review</span>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[11px] font-medium">1</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">High</span>
                    <h4 className="text-xs font-semibold text-gray-800 mt-1.5">Task Details Modal & Activity History</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="text-purple-600 font-medium">Ready to merge</span>
                      <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">ER</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 4 */}
              <div className="bg-gray-100/70 p-3 rounded-xl border border-gray-200/60">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-700">
                  <span>Completed</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-medium">4</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Done</span>
                    <h4 className="text-xs font-semibold text-gray-800 mt-1.5 line-through opacity-75">Socket.IO Broadcast Event Bridge</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="text-emerald-600 font-medium">Verified</span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">MM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-20 bg-gray-50/70 border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Everything Your Team Needs, Nothing You Don't
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Designed specifically to replace cluttered, over-engineered project management tools with a straightforward, responsive workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Visual Kanban Task Boards</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Categorize tasks cleanly across To Do, In Progress, Review, and Completed columns with drag-and-drop flexibility and priority filters.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Real-Time Instant Updates</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Powered by WebSockets so board updates, status changes, and new comments sync instantly across every team member's screen without reloading.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Task Comments & Activity Logs</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Keep discussions in context right on the task. Track complete historical audit trails of who moved, assigned, or completed each item.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Clear Dashboard Metrics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Stay on top of active, completed, and overdue items at a glance with calculated completion rates and project progress meters.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Team Directory & Workload</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View team member roles, active workloads, and live online/offline presence indicators to balance sprint assignments effectively.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Actionable Notifications</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Receive instant alerts whenever a task is assigned to you, commented on, moved to review, or nearing its deadline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works / Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            How Teams Work in TeamFlow
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            A simple 3-step loop that keeps projects progressing on schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Create & Scope Projects</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Set project objectives, target deadlines, priority levels, and invite your team members.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Assign & Move Tasks</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Break work into actionable cards, add subtask checklists, and advance them through your Kanban board.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Track & Ship Together</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Communicate in comments, receive real-time notifications, and review project completion metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Try Demo Accounts Banner */}
      <section id="teams" className="py-16 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to streamline your team's workflow?
          </h2>
          <p className="mt-3 text-indigo-100 text-sm max-w-xl mx-auto">
            Test drive TeamFlow right now with our pre-populated demo data, or create a brand new account in seconds.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => demoLogin('alex@teamflow.com')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              Sign In as Alex Johnson (Product Lead)
            </button>
            <button
              onClick={() => demoLogin('sarah@teamflow.com')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 font-medium text-xs transition-colors border border-indigo-500 cursor-pointer"
            >
              Sign In as Sarah Chen (Frontend)
            </button>
            <button
              onClick={() => demoLogin('marcus@teamflow.com')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 font-medium text-xs transition-colors border border-indigo-500 cursor-pointer"
            >
              Sign In as Marcus Miller (Full-Stack)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Kanban className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-gray-800">TeamFlow</span>
            <span>— Plan. Collaborate. Get Things Done.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onNavigateToLogin} className="hover:text-gray-900 transition-colors cursor-pointer">Login</button>
            <button onClick={onNavigateToSignUp} className="hover:text-gray-900 transition-colors cursor-pointer">Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
