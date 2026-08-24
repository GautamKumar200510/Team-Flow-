export type UserRole = 'Product Lead' | 'Full-Stack Developer' | 'Frontend Developer' | 'Backend Developer' | 'UI/UX Designer' | 'Project Manager' | 'QA Engineer' | 'Member';

export type UserStatus = 'online' | 'offline' | 'busy' | 'away';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string;
  bio?: string;
  status?: UserStatus;
  createdAt: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  deadline: string;
  members: string[]; // User IDs
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  category?: string;
  color?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  deadline: string;
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  checklist: ChecklistItem[];
  tags: string[];
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_status_changed'
  | 'comment_added'
  | 'deadline_approaching'
  | 'project_updated'
  | 'member_added'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  projectId?: string;
  taskId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}
