import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { MyTasksView } from './components/tasks/MyTasksView';
import { TeamView } from './components/team/TeamView';
import { NotificationsPageView } from './components/notifications/NotificationsPageView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { TaskStatus } from './types';

function MainApp() {
  const { user, isLoading } = useAuth();
  const {
    selectedProjectId,
    setSelectedProjectId,
    selectedTaskId,
    setSelectedTaskId,
  } = useProject();

  // Navigation & View States: Start on Login/Signup directly on the first page
  const [authView, setAuthView] = useState<'login' | 'signup' | 'landing'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<TaskStatus>('todo');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Loading TeamFlow...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, show Auth or Landing views
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onNavigateToSignUp={() => setAuthView('signup')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );
    }

    if (authView === 'signup') {
      return (
        <SignUpPage
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );
    }

    return (
      <LandingPage
        onNavigateToLogin={() => setAuthView('login')}
        onNavigateToSignUp={() => setAuthView('signup')}
      />
    );
  }

  // Helper for opening Create Task with optional column status
  const handleOpenCreateTask = (status: TaskStatus = 'todo') => {
    setCreateTaskDefaultStatus(status);
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'projects') {
            setSelectedProjectId(null);
          }
        }}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask('todo')}
          onNavigateToNotifications={() => setCurrentTab('notifications')}
        />

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToProjects={() => {
                setSelectedProjectId(null);
                setCurrentTab('projects');
              }}
              onNavigateToTasks={() => setCurrentTab('my-tasks')}
              onSelectProject={(projId) => {
                setSelectedProjectId(projId);
                setCurrentTab('projects');
              }}
              onSelectTask={(tId) => setSelectedTaskId(tId)}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenCreateTask={() => handleOpenCreateTask('todo')}
            />
          )}

          {/* Projects Tab */}
          {currentTab === 'projects' && (
            <>
              {selectedProjectId ? (
                <ProjectDetailView
                  projectId={selectedProjectId}
                  onBack={() => setSelectedProjectId(null)}
                  onOpenTaskDetails={(tId) => setSelectedTaskId(tId)}
                  onOpenCreateTask={(colStatus) => handleOpenCreateTask(colStatus || 'todo')}
                />
              ) : (
                <ProjectsView
                  onSelectProject={(projId) => setSelectedProjectId(projId)}
                  onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                />
              )}
            </>
          )}

          {/* My Tasks Tab */}
          {currentTab === 'my-tasks' && (
            <MyTasksView
              onOpenTaskDetails={(tId) => setSelectedTaskId(tId)}
              onOpenCreateTask={() => handleOpenCreateTask('todo')}
              onSelectProject={(projId) => {
                setSelectedProjectId(projId);
                setCurrentTab('projects');
              }}
            />
          )}

          {/* Team Directory Tab */}
          {currentTab === 'team' && <TeamView />}

          {/* Notifications Tab */}
          {currentTab === 'notifications' && (
            <NotificationsPageView
              onSelectProject={(projId) => {
                setSelectedProjectId(projId);
                setCurrentTab('projects');
              }}
              onSelectTask={(tId) => setSelectedTaskId(tId)}
            />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        defaultProjectId={selectedProjectId || undefined}
        defaultStatus={createTaskDefaultStatus}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <ProjectProvider>
            <MainApp />
          </ProjectProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
