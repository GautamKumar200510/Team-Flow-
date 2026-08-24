import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from './db.js';
import { authMiddleware, generateToken, AuthenticatedRequest } from './auth.js';
import { Server as SocketIOServer } from 'socket.io';
import { Task, Project, Comment, ActivityLog, Notification, TaskStatus } from '../src/types.js';

export function createApiRouter(io?: SocketIOServer) {
  const router = Router();

  // Helper to emit events safely
  const emitRealtime = (event: string, data: any) => {
    if (io) {
      io.emit(event, data);
    }
  };

  // Helper to send notification to a user
  const notifyUser = (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    meta: { projectId?: string; taskId?: string; link?: string } = {}
  ) => {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      projectId: meta.projectId,
      taskId: meta.taskId,
      link: meta.link,
      createdAt: new Date().toISOString(),
    };
    dbService.createNotification(notif);
    emitRealtime(`notification:${userId}`, notif);
  };

  // Helper to log activities
  const logActivity = (
    userId: string,
    action: string,
    details: string,
    meta: { projectId?: string; taskId?: string } = {}
  ) => {
    const activity: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      action,
      details,
      projectId: meta.projectId,
      taskId: meta.taskId,
      timestamp: new Date().toISOString(),
    };
    const saved = dbService.addActivity(activity);
    emitRealtime('activity:new', saved);
  };

  // ================= AUTH ROUTES =================
  router.post('/auth/register', async (req, res) => {
    try {
      const { name, email, password, role, bio } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }

      const existingUser = dbService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = dbService.createUser({
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'Member',
        bio: bio || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        status: 'online',
        createdAt: new Date().toISOString(),
        passwordHash,
      });

      // Add to default projects so they immediately have items to see
      const allProjects = dbService.getProjects();
      if (allProjects.length > 0) {
        dbService.addProjectMember(allProjects[0].id, newUser.id);
      }

      const token = generateToken(newUser);
      emitRealtime('team:updated', dbService.getUsers());

      res.status(201).json({
        token,
        user: newUser,
        message: 'Account created successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Server error during registration.' });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const userWithHash = dbService.getUserByEmail(email);
      if (!userWithHash) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, userWithHash.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      // Mark online
      dbService.setUserStatus(userWithHash.id, 'online');
      const safeUser = dbService.getUserById(userWithHash.id)!;
      const token = generateToken(safeUser);

      emitRealtime('user:status_changed', { userId: safeUser.id, status: 'online' });

      res.json({
        token,
        user: safeUser,
        message: 'Login successful.',
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Server error during login.' });
    }
  });

  router.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  router.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, role, bio, avatar, status } = req.body;
      const updated = dbService.updateUser(req.user!.id, {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(status && { status }),
      });

      if (!updated) {
        return res.status(404).json({ message: 'User not found.' });
      }

      emitRealtime('team:updated', dbService.getUsers());
      res.json({ user: updated, message: 'Profile updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to update profile.' });
    }
  });

  router.put('/auth/password', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }

      const userWithHash = dbService.getUserByEmail(req.user!.email);
      if (!userWithHash) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, userWithHash.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      dbService.updateUserPassword(req.user!.id, newHash);

      res.json({ message: 'Password updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to update password.' });
    }
  });

  // ================= DASHBOARD STATS =================
  router.get('/dashboard/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const projects = dbService.getProjects();
    const tasks = dbService.getTasks();
    const now = new Date();

    const activeTasks = tasks.filter((t) => t.status !== 'completed').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      return new Date(t.deadline) < now;
    }).length;

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      totalProjects: projects.length,
      activeTasks,
      completedTasks,
      overdueTasks,
      completionRate,
    });
  });

  // ================= PROJECTS ROUTES =================
  router.get('/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const projects = dbService.getProjects();
    res.json({ projects });
  });

  router.get('/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const project = dbService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const tasks = dbService.getTasks(project.id);
    res.json({ project, tasks });
  });

  router.post('/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, priority, deadline, category, color, members } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Project name is required.' });
      }

      const initialMembers = Array.isArray(members) && members.length > 0 ? members : [req.user!.id];
      if (!initialMembers.includes(req.user!.id)) {
        initialMembers.push(req.user!.id);
      }

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        description: description?.trim() || '',
        status: 'active',
        priority: priority || 'medium',
        deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
        members: initialMembers,
        createdBy: req.user!.id,
        createdAt: new Date().toISOString(),
        category: category || 'General',
        color: color || randomColor,
      };

      const saved = dbService.createProject(newProject);

      logActivity(req.user!.id, 'created_project', `created project "${saved.name}"`, {
        projectId: saved.id,
      });

      // Notify other members
      initialMembers.forEach((memberId) => {
        if (memberId !== req.user!.id) {
          notifyUser(
            memberId,
            'Added to Project',
            `${req.user!.name} added you to project "${saved.name}".`,
            'member_added',
            { projectId: saved.id }
          );
        }
      });

      emitRealtime('project:created', saved);
      res.status(201).json({ project: saved, message: 'Project created successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to create project.' });
    }
  });

  router.put('/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, status, priority, deadline, category, color, members } = req.body;
      const updated = dbService.updateProject(req.params.id, {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(deadline && { deadline }),
        ...(category && { category }),
        ...(color && { color }),
        ...(members && { members }),
      });

      if (!updated) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      logActivity(req.user!.id, 'updated_project', `updated project "${updated.name}" details`, {
        projectId: updated.id,
      });

      emitRealtime('project:updated', updated);
      res.json({ project: updated, message: 'Project updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to update project.' });
    }
  });

  router.delete('/projects/all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      dbService.deleteAllProjects();
      logActivity(req.user!.id, 'deleted_project', 'cleared and removed all projects');
      emitRealtime('system:reset', {});
      res.json({ message: 'All projects deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to delete all projects.' });
    }
  });

  router.delete('/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const project = dbService.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      dbService.deleteProject(req.params.id);

      logActivity(req.user!.id, 'deleted_project', `deleted project "${project.name}"`);

      emitRealtime('project:deleted', { id: req.params.id });
      res.json({ message: 'Project deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to delete project.' });
    }
  });

  router.post('/projects/:id/members', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'userId is required.' });
      }

      const updated = dbService.addProjectMember(req.params.id, userId);
      if (!updated) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      const targetUser = dbService.getUserById(userId);
      logActivity(
        req.user!.id,
        'added_member',
        `added ${targetUser ? targetUser.name : 'a new member'} to "${updated.name}"`,
        { projectId: updated.id }
      );

      if (userId !== req.user!.id) {
        notifyUser(
          userId,
          'Added to Project',
          `${req.user!.name} added you to project "${updated.name}".`,
          'member_added',
          { projectId: updated.id }
        );
      }

      emitRealtime('project:updated', updated);
      res.json({ project: updated, message: 'Member added successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to add member.' });
    }
  });

  // ================= TASKS ROUTES =================
  router.get('/tasks', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.query.projectId as string | undefined;
    const tasks = dbService.getTasks(projectId);
    res.json({ tasks });
  });

  router.get('/tasks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const task = dbService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    const comments = dbService.getComments(task.id);
    res.json({ task, comments });
  });

  router.post('/tasks', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { projectId, title, description, status, priority, deadline, assigneeId, tags, checklist } = req.body;

      if (!projectId || !title) {
        return res.status(400).json({ message: 'Project ID and task title are required.' });
      }

      const project = dbService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Selected project does not exist.' });
      }

      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        projectId,
        title: title.trim(),
        description: description?.trim() || '',
        status: status || 'todo',
        priority: priority || 'medium',
        deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        assigneeId: assigneeId || undefined,
        createdBy: req.user!.id,
        createdAt: new Date().toISOString(),
        checklist: Array.isArray(checklist) ? checklist : [],
        tags: Array.isArray(tags) ? tags : [],
        order: Date.now(),
      };

      const saved = dbService.createTask(newTask);

      logActivity(req.user!.id, 'created_task', `created task "${saved.title}" in "${project.name}"`, {
        projectId: project.id,
        taskId: saved.id,
      });

      if (assigneeId && assigneeId !== req.user!.id) {
        notifyUser(
          assigneeId,
          'New Task Assigned',
          `${req.user!.name} assigned you to "${saved.title}".`,
          'task_assigned',
          { projectId: project.id, taskId: saved.id }
        );
      }

      emitRealtime('task:created', saved);
      res.status(201).json({ task: saved, message: 'Task created successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to create task.' });
    }
  });

  router.put('/tasks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const existing = dbService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const { title, description, status, priority, deadline, assigneeId, tags, checklist } = req.body;

      const previousStatus = existing.status;
      const previousAssignee = existing.assigneeId;

      const updated = dbService.updateTask(req.params.id, {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(deadline && { deadline }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(tags && { tags }),
        ...(checklist && { checklist }),
      });

      if (!updated) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      // Check status change
      if (status && status !== previousStatus) {
        const statusLabels: Record<TaskStatus, string> = {
          todo: 'To Do',
          in_progress: 'In Progress',
          review: 'Review',
          completed: 'Completed',
        };

        logActivity(
          req.user!.id,
          status === 'completed' ? 'completed_task' : 'moved_task',
          `moved "${updated.title}" to ${statusLabels[status as TaskStatus]}`,
          { projectId: updated.projectId, taskId: updated.id }
        );

        if (updated.assigneeId && updated.assigneeId !== req.user!.id) {
          notifyUser(
            updated.assigneeId,
            'Task Status Updated',
            `${req.user!.name} changed status of "${updated.title}" to ${statusLabels[status as TaskStatus]}.`,
            status === 'completed' ? 'task_completed' : 'task_status_changed',
            { projectId: updated.projectId, taskId: updated.id }
          );
        }
      }

      // Check assignee change
      if (assigneeId && assigneeId !== previousAssignee && assigneeId !== req.user!.id) {
        notifyUser(
          assigneeId,
          'Task Assigned',
          `${req.user!.name} assigned you to "${updated.title}".`,
          'task_assigned',
          { projectId: updated.projectId, taskId: updated.id }
        );
      }

      emitRealtime('task:updated', updated);
      res.json({ task: updated, message: 'Task updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to update task.' });
    }
  });

  router.put('/tasks/:id/move', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
      }

      const existing = dbService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const updated = dbService.updateTask(req.params.id, { status: status as TaskStatus });
      if (!updated) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const statusLabels: Record<TaskStatus, string> = {
        todo: 'To Do',
        in_progress: 'In Progress',
        review: 'Review',
        completed: 'Completed',
      };

      logActivity(
        req.user!.id,
        status === 'completed' ? 'completed_task' : 'moved_task',
        `moved "${updated.title}" to ${statusLabels[status as TaskStatus]}`,
        { projectId: updated.projectId, taskId: updated.id }
      );

      if (updated.assigneeId && updated.assigneeId !== req.user!.id) {
        notifyUser(
          updated.assigneeId,
          'Task Status Changed',
          `${req.user!.name} moved "${updated.title}" to ${statusLabels[status as TaskStatus]}.`,
          status === 'completed' ? 'task_completed' : 'task_status_changed',
          { projectId: updated.projectId, taskId: updated.id }
        );
      }

      emitRealtime('task:moved', updated);
      res.json({ task: updated, message: 'Task moved successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to move task.' });
    }
  });

  router.delete('/tasks/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const task = dbService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      dbService.deleteTask(req.params.id);

      logActivity(req.user!.id, 'deleted_task', `deleted task "${task.title}"`, {
        projectId: task.projectId,
      });

      emitRealtime('task:deleted', { id: req.params.id, projectId: task.projectId });
      res.json({ message: 'Task deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to delete task.' });
    }
  });

  // ================= COMMENTS ROUTES =================
  router.get('/tasks/:id/comments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const comments = dbService.getComments(req.params.id);
    res.json({ comments });
  });

  router.post('/tasks/:id/comments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
      }

      const task = dbService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const newComment: Comment = {
        id: `comm-${Date.now()}`,
        taskId: task.id,
        userId: req.user!.id,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const saved = dbService.createComment(newComment);

      logActivity(req.user!.id, 'commented', `commented on "${task.title}"`, {
        projectId: task.projectId,
        taskId: task.id,
      });

      // Notify task assignee if someone else commented
      if (task.assigneeId && task.assigneeId !== req.user!.id) {
        notifyUser(
          task.assigneeId,
          'New Comment on Task',
          `${req.user!.name} commented on "${task.title}".`,
          'comment_added',
          { projectId: task.projectId, taskId: task.id }
        );
      }

      emitRealtime('comment:added', saved);
      res.status(201).json({ comment: saved, message: 'Comment posted.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to add comment.' });
    }
  });

  router.delete('/comments/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      dbService.deleteComment(req.params.id);
      emitRealtime('comment:deleted', { id: req.params.id });
      res.json({ message: 'Comment deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to delete comment.' });
    }
  });

  // ================= TEAM ROUTES =================
  router.get('/team', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const users = dbService.getUsers();
    const tasks = dbService.getTasks();
    const projects = dbService.getProjects();

    const teamWithMetrics = users.map((user) => {
      const assignedTasks = tasks.filter((t) => t.assigneeId === user.id);
      const activeTasks = assignedTasks.filter((t) => t.status !== 'completed').length;
      const completedTasks = assignedTasks.filter((t) => t.status === 'completed').length;
      const userProjects = projects.filter((p) => p.members.includes(user.id)).length;

      return {
        ...user,
        metrics: {
          assignedTasksCount: assignedTasks.length,
          activeTasksCount: activeTasks,
          completedTasksCount: completedTasks,
          projectsCount: userProjects,
        },
      };
    });

    res.json({ team: teamWithMetrics });
  });

  router.post('/team/invite', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, email, role } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
      }

      const existing = dbService.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'User with this email is already on the team.' });
      }

      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('password123', salt);

      const invitedUser = dbService.createUser({
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'Member',
        bio: 'Joined TeamFlow workspace.',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        status: 'offline',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
      });

      logActivity(req.user!.id, 'invited_member', `invited ${invitedUser.name} (${invitedUser.email}) to the team`);

      emitRealtime('team:updated', dbService.getUsers());
      res.status(201).json({ user: invitedUser, message: 'Invitation sent and member added with default password "password123".' });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to invite member.' });
    }
  });

  // ================= NOTIFICATIONS ROUTES =================
  router.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const notifications = dbService.getNotifications(req.user!.id);
    res.json({ notifications });
  });

  router.put('/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const updated = dbService.markNotificationRead(req.params.id, req.user!.id);
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json({ notification: updated });
  });

  router.put('/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    dbService.markAllNotificationsRead(req.user!.id);
    res.json({ message: 'All notifications marked as read.' });
  });

  router.delete('/notifications/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    dbService.deleteNotification(req.params.id, req.user!.id);
    res.json({ message: 'Notification deleted.' });
  });

  // ================= ACTIVITIES ROUTES =================
  router.get('/activities', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const projectId = req.query.projectId as string | undefined;
    const activities = dbService.getActivities(limit, projectId);
    res.json({ activities });
  });

  // ================= SYSTEM / DEMO RESET =================
  router.post('/reset-demo-data', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await dbService.reset();
      emitRealtime('system:reset', { message: 'Database reset to initial demo state' });
      res.json({ message: 'Demo data successfully reseeded.' });
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to reset demo data.' });
    }
  });

  return router;
}
