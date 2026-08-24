import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, User, Notification, ActivityLog, DashboardStats, TaskStatus } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useToast } from './ToastContext';

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  team: (User & { metrics?: any })[];
  notifications: Notification[];
  activities: ActivityLog[];
  dashboardStats: DashboardStats | null;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  searchQuery: string;
  isLoadingData: boolean;
  activeProject: Project | null;
  activeTask: Task | null;

  // Setters
  setSelectedProjectId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Data fetching
  refreshData: () => Promise<void>;

  // Project operations
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteAllProjects: () => Promise<void>;
  addMemberToProject: (projectId: string, userId: string) => Promise<void>;

  // Task operations
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Comments
  addComment: (taskId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Team
  inviteTeamMember: (data: { name: string; email: string; role: string }) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Reset demo
  resetDemoData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const { success, error: toastError, info } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<(User & { metrics?: any })[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Compute active project and task
  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Refresh all state from API
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoadingData(false);
      return;
    }

    try {
      const [projRes, tasksRes, teamRes, notifRes, actRes, statsRes] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getTeam(),
        api.getNotifications(),
        api.getActivities(30),
        api.getDashboardStats(),
      ]);

      setProjects(projRes.projects);
      setTasks(tasksRes.tasks);
      setTeam(teamRes.team);
      setNotifications(notifRes.notifications);
      setActivities(actRes.activities);
      setDashboardStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load project data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    // Task Events
    const handleTaskCreated = (newTask: Task) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      refreshStats();
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      refreshStats();
    };

    const handleTaskMoved = (movedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === movedTask.id ? movedTask : t)));
      refreshStats();
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
      refreshStats();
    };

    // Project Events
    const handleProjectCreated = (newProject: Project) => {
      setProjects((prev) => {
        if (prev.some((p) => p.id === newProject.id)) return prev;
        return [newProject, ...prev];
      });
      refreshStats();
    };

    const handleProjectUpdated = (updatedProject: Project) => {
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    };

    const handleProjectDeleted = ({ id }: { id: string }) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.filter((t) => t.projectId !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      refreshStats();
    };

    // Activity Events
    const handleActivityNew = (activity: ActivityLog) => {
      setActivities((prev) => [activity, ...prev.slice(0, 49)]);
    };

    // Notification Events
    const handleNotification = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      info(notif.message, notif.title);
    };

    // Team Events
    const handleTeamUpdated = (users: (User & { metrics?: any })[]) => {
      setTeam(users);
    };

    // Reset Event
    const handleSystemReset = () => {
      refreshData();
      info('Database was reset to default demo records.', 'System Notice');
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('project:created', handleProjectCreated);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('project:deleted', handleProjectDeleted);
    socket.on('activity:new', handleActivityNew);
    socket.on('team:updated', handleTeamUpdated);
    socket.on('system:reset', handleSystemReset);

    if (user?.id) {
      socket.on(`notification:${user.id}`, handleNotification);
    }

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('project:created', handleProjectCreated);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('project:deleted', handleProjectDeleted);
      socket.off('activity:new', handleActivityNew);
      socket.off('team:updated', handleTeamUpdated);
      socket.off('system:reset', handleSystemReset);
      if (user?.id) {
        socket.off(`notification:${user.id}`, handleNotification);
      }
    };
  }, [socket, isAuthenticated, user?.id, selectedTaskId, selectedProjectId, info, refreshData]);

  const refreshStats = async () => {
    try {
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
    } catch {
      // ignore silent stats error
    }
  };

  // Operations
  const createProject = async (data: Partial<Project>): Promise<Project> => {
    try {
      const res = await api.createProject(data);
      setProjects((prev) => [res.project, ...prev]);
      success(`Project "${res.project.name}" created successfully.`);
      refreshStats();
      return res.project;
    } catch (err: any) {
      toastError(err.message || 'Failed to create project.');
      throw err;
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const res = await api.updateProject(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.project : p)));
      success(`Project "${res.project.name}" updated.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update project.');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.filter((t) => t.projectId !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      success('Project removed successfully.');
      refreshStats();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete project.');
      throw err;
    }
  };

  const deleteAllProjects = async () => {
    try {
      await api.deleteAllProjects();
      setProjects([]);
      setTasks([]);
      setSelectedProjectId(null);
      setSelectedTaskId(null);
      success('All projects and associated tasks have been removed.');
      refreshStats();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete all projects.');
      throw err;
    }
  };

  const addMemberToProject = async (projectId: string, userId: string) => {
    try {
      const res = await api.addProjectMember(projectId, userId);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? res.project : p)));
      success('Member added to project.');
    } catch (err: any) {
      toastError(err.message || 'Failed to add member.');
      throw err;
    }
  };

  const createTask = async (data: Partial<Task>): Promise<Task> => {
    try {
      const res = await api.createTask(data);
      setTasks((prev) => [res.task, ...prev]);
      success(`Task "${res.task.title}" added.`);
      refreshStats();
      return res.task;
    } catch (err: any) {
      toastError(err.message || 'Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      const res = await api.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
      success('Task updated successfully.');
      refreshStats();
    } catch (err: any) {
      toastError(err.message || 'Failed to update task.');
      refreshData();
      throw err;
    }
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    // Immediate optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await api.moveTask(id, newStatus);
      refreshStats();
    } catch (err: any) {
      setTasks(previousTasks);
      toastError(err.message || 'Failed to move task.');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
      success('Task deleted.');
      refreshStats();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task.');
      throw err;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      await api.createComment(taskId, content);
      success('Comment posted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to post comment.');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      success('Comment removed.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete comment.');
      throw err;
    }
  };

  const inviteTeamMember = async (data: { name: string; email: string; role: string }) => {
    try {
      const res = await api.inviteMember(data);
      setTeam((prev) => [...prev, res.user]);
      success(`Invitation sent to ${data.name}. Default password: password123`);
    } catch (err: any) {
      toastError(err.message || 'Failed to invite team member.');
      throw err;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await api.markNotificationRead(id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await api.markAllNotificationsRead();
      success('All notifications marked as read.');
    } catch (err: any) {
      toastError('Failed to mark all as read.');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await api.deleteNotification(id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDemoData();
      await refreshData();
      success('Demo data restored to initial state.');
    } catch (err: any) {
      toastError(err.message || 'Failed to reset demo data.');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        tasks,
        team,
        notifications,
        activities,
        dashboardStats,
        selectedProjectId,
        selectedTaskId,
        searchQuery,
        isLoadingData,
        activeProject,
        activeTask,
        setSelectedProjectId,
        setSelectedTaskId,
        setSearchQuery,
        refreshData,
        createProject,
        updateProject,
        deleteProject,
        deleteAllProjects,
        addMemberToProject,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
        addComment,
        deleteComment,
        inviteTeamMember,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        resetDemoData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
