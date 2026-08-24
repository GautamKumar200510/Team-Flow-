import { User, Project, Task, Comment, ActivityLog, Notification, AuthResponse, DashboardStats } from '../types';

const BASE_URL = '/api';

// Local storage keys for client fallback mode (e.g. static hosting on Vercel)
const LS_USERS_KEY = 'teamflow_local_users';
const LS_PROJECTS_KEY = 'teamflow_local_projects';
const LS_TASKS_KEY = 'teamflow_local_tasks';
const LS_COMMENTS_KEY = 'teamflow_local_comments';
const LS_ACTIVITIES_KEY = 'teamflow_local_activities';
const LS_NOTIFICATIONS_KEY = 'teamflow_local_notifications';

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

class ApiClient {
  private isFallbackMode = false;

  private getToken(): string | null {
    return localStorage.getItem('teamflow_token');
  }

  private getStoredCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('teamflow_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setStoredCurrentUser(user: User, token: string): void {
    localStorage.setItem('teamflow_user', JSON.stringify(user));
    localStorage.setItem('teamflow_token', token);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // If the backend returns 404 (static deployment without server routes), switch to fallback
      if (response.status === 404) {
        this.isFallbackMode = true;
        throw new Error('404_FALLBACK');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Returned HTML (e.g. index.html SPA rewrite), trigger fallback
        this.isFallbackMode = true;
        throw new Error('NON_JSON_FALLBACK');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      if (err.message === '404_FALLBACK' || err.message === 'NON_JSON_FALLBACK' || err.name === 'TypeError') {
        this.isFallbackMode = true;
        return this.handleFallback<T>(endpoint, options);
      }
      throw err;
    }
  }

  // Client-side fallback handler for static hosting deployments (e.g. Vercel static)
  private handleFallback<T>(endpoint: string, options: RequestInit): T {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};
    const currentUser = this.getStoredCurrentUser();

    // 1. Auth: Register
    if (endpoint === '/auth/register' && method === 'POST') {
      const { name, email, role, bio } = body;
      const users = getLocalData<User[]>(LS_USERS_KEY, []);
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('A user with this email already exists.');
      }
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'Member',
        bio: bio || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        status: 'online',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      setLocalData(LS_USERS_KEY, users);
      const token = `local-jwt-${newUser.id}-${Date.now()}`;
      this.setStoredCurrentUser(newUser, token);
      return { user: newUser, token } as unknown as T;
    }

    // 2. Auth: Login
    if (endpoint === '/auth/login' && method === 'POST') {
      const { email } = body;
      const users = getLocalData<User[]>(LS_USERS_KEY, []);
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      const token = `local-jwt-${user.id}-${Date.now()}`;
      this.setStoredCurrentUser(user, token);
      return { user, token } as unknown as T;
    }

    // 3. Auth: Get Me
    if (endpoint === '/auth/me') {
      if (!currentUser) throw new Error('Not authenticated');
      return { user: currentUser } as unknown as T;
    }

    // 4. Auth: Update Profile
    if (endpoint === '/auth/profile' && method === 'PUT') {
      if (!currentUser) throw new Error('Not authenticated');
      const updated = { ...currentUser, ...body };
      const users = getLocalData<User[]>(LS_USERS_KEY, []);
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) users[idx] = updated;
      setLocalData(LS_USERS_KEY, users);
      this.setStoredCurrentUser(updated, this.getToken() || 'local-jwt');
      return { user: updated, message: 'Profile updated successfully' } as unknown as T;
    }

    // 5. Projects: Get All
    if (endpoint.startsWith('/projects') && method === 'GET') {
      const projects = getLocalData<Project[]>(LS_PROJECTS_KEY, []);
      return { projects } as unknown as T;
    }

    // 6. Projects: Create
    if (endpoint === '/projects' && method === 'POST') {
      const projects = getLocalData<Project[]>(LS_PROJECTS_KEY, []);
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: body.name || 'New Project',
        description: body.description || '',
        status: body.status || 'active',
        priority: body.priority || 'medium',
        deadline: body.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        members: body.members || [currentUser?.id || 'usr-1'],
        createdBy: currentUser?.id || 'usr-1',
        createdAt: new Date().toISOString(),
        category: body.category || 'General',
        color: body.color || '#4F46E5',
      };
      projects.push(newProj);
      setLocalData(LS_PROJECTS_KEY, projects);
      return { project: newProj, message: 'Project created successfully' } as unknown as T;
    }

    // 7. Projects: Delete
    if (endpoint.startsWith('/projects/') && method === 'DELETE') {
      const projId = endpoint.replace('/projects/', '');
      let projects = getLocalData<Project[]>(LS_PROJECTS_KEY, []);
      projects = projects.filter((p) => p.id !== projId);
      setLocalData(LS_PROJECTS_KEY, projects);
      return { message: 'Project deleted' } as unknown as T;
    }

    // 8. Tasks: Get All
    if (endpoint.startsWith('/tasks') && method === 'GET') {
      const tasks = getLocalData<Task[]>(LS_TASKS_KEY, []);
      return { tasks } as unknown as T;
    }

    // 9. Tasks: Create
    if (endpoint === '/tasks' && method === 'POST') {
      const tasks = getLocalData<Task[]>(LS_TASKS_KEY, []);
      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        projectId: body.projectId || 'proj-1',
        title: body.title || 'New Task',
        description: body.description || '',
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        deadline: body.deadline || new Date(Date.now() + 3 * 86400000).toISOString(),
        assigneeId: body.assigneeId,
        createdBy: currentUser?.id || 'usr-1',
        createdAt: new Date().toISOString(),
        checklist: body.checklist || [],
        tags: body.tags || [],
        order: tasks.length + 1,
      };
      tasks.push(newTask);
      setLocalData(LS_TASKS_KEY, tasks);
      return { task: newTask, message: 'Task created successfully' } as unknown as T;
    }

    // 10. Tasks: Update or Move
    if (endpoint.startsWith('/tasks/') && method === 'PUT') {
      const taskId = endpoint.split('/')[2];
      const tasks = getLocalData<Task[]>(LS_TASKS_KEY, []);
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...body };
        setLocalData(LS_TASKS_KEY, tasks);
        return { task: tasks[idx], message: 'Task updated' } as unknown as T;
      }
      return { task: body, message: 'Task updated' } as unknown as T;
    }

    // 11. Tasks: Delete
    if (endpoint.startsWith('/tasks/') && method === 'DELETE') {
      const taskId = endpoint.replace('/tasks/', '');
      let tasks = getLocalData<Task[]>(LS_TASKS_KEY, []);
      tasks = tasks.filter((t) => t.id !== taskId);
      setLocalData(LS_TASKS_KEY, tasks);
      return { message: 'Task deleted' } as unknown as T;
    }

    // 12. Team
    if (endpoint === '/team') {
      const users = getLocalData<User[]>(LS_USERS_KEY, []);
      if (currentUser && !users.find((u) => u.id === currentUser.id)) {
        users.push(currentUser);
      }
      return { team: users } as unknown as T;
    }

    // 13. Notifications
    if (endpoint === '/notifications') {
      const notifications = getLocalData<Notification[]>(LS_NOTIFICATIONS_KEY, []);
      return { notifications } as unknown as T;
    }

    // 14. Activities
    if (endpoint.startsWith('/activities')) {
      const activities = getLocalData<ActivityLog[]>(LS_ACTIVITIES_KEY, []);
      return { activities } as unknown as T;
    }

    // 15. Dashboard Stats
    if (endpoint === '/dashboard/stats') {
      const projects = getLocalData<Project[]>(LS_PROJECTS_KEY, []);
      const tasks = getLocalData<Task[]>(LS_TASKS_KEY, []);
      const users = getLocalData<User[]>(LS_USERS_KEY, []);
      return {
        totalProjects: projects.length,
        activeTasks: tasks.filter((t) => t.status !== 'completed').length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        teamMembersCount: users.length,
        overdueTasks: 0,
        completionRate: tasks.length ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) : 0,
      } as unknown as T;
    }

    return {} as unknown as T;
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { name: string; email: string; password: string; role?: string; bio?: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(profileData: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/projects');
  }

  async getProject(id: string): Promise<{ project: Project; tasks: Task[] }> {
    return this.request<{ project: Project; tasks: Task[] }>(`/projects/${id}`);
  }

  async createProject(project: Partial<Project>): Promise<{ project: Project; message: string }> {
    return this.request<{ project: Project; message: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<{ project: Project; message: string }> {
    return this.request<{ project: Project; message: string }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllProjects(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/projects/all', {
      method: 'DELETE',
    });
  }

  async addProjectMember(projectId: string, userId: string): Promise<{ project: Project; message: string }> {
    return this.request<{ project: Project; message: string }>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Tasks
  async getTasks(projectId?: string): Promise<{ tasks: Task[] }> {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    return this.request<{ tasks: Task[] }>(url);
  }

  async getTask(id: string): Promise<{ task: Task; comments: Comment[] }> {
    return this.request<{ task: Task; comments: Comment[] }>(`/tasks/${id}`);
  }

  async createTask(task: Partial<Task>): Promise<{ task: Task; message: string }> {
    return this.request<{ task: Task; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<{ task: Task; message: string }> {
    return this.request<{ task: Task; message: string }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async moveTask(id: string, status: Task['status']): Promise<{ task: Task; message: string }> {
    return this.request<{ task: Task; message: string }>(`/tasks/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getComments(taskId: string): Promise<{ comments: Comment[] }> {
    return this.request<{ comments: Comment[] }>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: string, content: string): Promise<{ comment: Comment; message: string }> {
    return this.request<{ comment: Comment; message: string }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Team
  async getTeam(): Promise<{ team: (User & { metrics?: any })[] }> {
    return this.request<{ team: (User & { metrics?: any })[] }>('/team');
  }

  async inviteMember(memberData: { name: string; email: string; role: string }): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/team/invite', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return this.request<{ notifications: Notification[] }>('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ notification: Notification }> {
    return this.request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(limit = 20, projectId?: string): Promise<{ activities: ActivityLog[] }> {
    const url = projectId ? `/activities?limit=${limit}&projectId=${projectId}` : `/activities?limit=${limit}`;
    return this.request<{ activities: ActivityLog[] }>(url);
  }

  // Demo Reset
  async resetDemoData(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/reset-demo-data', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
