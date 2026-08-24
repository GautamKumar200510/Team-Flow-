import bcrypt from 'bcryptjs';
import { User, Project, Task, Comment, ActivityLog, Notification } from '../src/types.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: ActivityLog[];
  notifications: Notification[];
}

let db: DatabaseSchema = {
  users: [],
  projects: [],
  tasks: [],
  comments: [],
  activities: [],
  notifications: [],
};

// Seed clean initial workspace database
export async function seedDatabase() {
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin',
      name: 'Workspace Admin',
      email: 'admin@teamflow.com',
      role: 'Project Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Team workspace administrator.',
      status: 'online',
      createdAt: new Date().toISOString(),
      passwordHash: defaultPasswordHash,
    },
  ];

  db = {
    users,
    projects: [],
    tasks: [],
    comments: [],
    activities: [],
    notifications: [],
  };
}

// Database helper queries & mutations
export const dbService = {
  // Users
  getUsers: () => db.users.map(({ passwordHash, ...u }) => u),
  getUserById: (id: string) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
  getUserByEmail: (email: string) => db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User & { passwordHash: string }) => {
    db.users.push(user);
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates };
    const { passwordHash, ...safeUser } = db.users[idx];
    return safeUser;
  },
  updateUserPassword: (id: string, newPasswordHash: string) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    return true;
  },
  setUserStatus: (id: string, status: User['status']) => {
    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.status = status;
      return true;
    }
    return false;
  },

  // Projects
  getProjects: () => [...db.projects],
  getProjectById: (id: string) => db.projects.find((p) => p.id === id) || null,
  createProject: (project: Project) => {
    db.projects.unshift(project);
    return project;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.projects[idx] = { ...db.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    return db.projects[idx];
  },
  deleteProject: (id: string) => {
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    db.projects.splice(idx, 1);
    // Also delete associated tasks
    db.tasks = db.tasks.filter((t) => t.projectId !== id);
    return true;
  },
  deleteAllProjects: () => {
    db.projects = [];
    db.tasks = [];
    db.comments = [];
    return true;
  },
  addProjectMember: (projectId: string, userId: string) => {
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) return null;
    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }
    return project;
  },

  // Tasks
  getTasks: (projectId?: string) => {
    if (projectId) {
      return db.tasks.filter((t) => t.projectId === projectId);
    }
    return [...db.tasks];
  },
  getTaskById: (id: string) => db.tasks.find((t) => t.id === id) || null,
  createTask: (task: Task) => {
    db.tasks.unshift(task);
    return task;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    return db.tasks[idx];
  },
  deleteTask: (id: string) => {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    db.tasks.splice(idx, 1);
    // Delete associated comments
    db.comments = db.comments.filter((c) => c.taskId !== id);
    return true;
  },

  // Comments
  getComments: (taskId: string) => {
    return db.comments
      .filter((c) => c.taskId === taskId)
      .map((c) => {
        const user = dbService.getUserById(c.userId);
        return {
          ...c,
          author: user ? { id: user.id, name: user.name, avatar: user.avatar, role: user.role } : undefined,
        };
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  createComment: (comment: Comment) => {
    db.comments.push(comment);
    const user = dbService.getUserById(comment.userId);
    return {
      ...comment,
      author: user ? { id: user.id, name: user.name, avatar: user.avatar, role: user.role } : undefined,
    };
  },
  deleteComment: (id: string) => {
    const idx = db.comments.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    db.comments.splice(idx, 1);
    return true;
  },

  // Activities
  getActivities: (limit = 20, projectId?: string) => {
    let list = [...db.activities];
    if (projectId) {
      list = list.filter((a) => a.projectId === projectId);
    }
    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((a) => {
        const user = dbService.getUserById(a.userId);
        return {
          ...a,
          user: user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
        };
      });
  },
  addActivity: (activity: ActivityLog) => {
    db.activities.unshift(activity);
    const user = dbService.getUserById(activity.userId);
    return {
      ...activity,
      user: user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
    };
  },

  // Notifications
  getNotifications: (userId: string) => {
    return db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  createNotification: (notification: Notification) => {
    db.notifications.unshift(notification);
    return notification;
  },
  markNotificationRead: (id: string, userId: string) => {
    const notif = db.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      return notif;
    }
    return null;
  },
  markAllNotificationsRead: (userId: string) => {
    db.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.read = true;
      });
    return true;
  },
  deleteNotification: (id: string, userId: string) => {
    const idx = db.notifications.findIndex((n) => n.id === id && n.userId === userId);
    if (idx === -1) return false;
    db.notifications.splice(idx, 1);
    return true;
  },

  // Reset database to initial seed
  reset: async () => {
    await seedDatabase();
    return true;
  },
};
