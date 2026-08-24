import { Server as SocketIOServer, Socket } from 'socket.io';
import { dbService } from './db.js';

const connectedUsers = new Map<string, { socketId: string; user: any }>();

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    let currentUserId: string | null = null;

    socket.on('user:join', (userData: { id: string; name: string; email: string }) => {
      if (!userData || !userData.id) return;
      currentUserId = userData.id;
      connectedUsers.set(socket.id, { socketId: socket.id, user: userData });

      dbService.setUserStatus(userData.id, 'online');
      io.emit('user:presence', {
        userId: userData.id,
        status: 'online',
        activeCount: connectedUsers.size,
      });
    });

    socket.on('task:typing', (data: { taskId: string; userName: string }) => {
      socket.broadcast.emit('task:user_typing', data);
    });

    socket.on('disconnect', () => {
      if (currentUserId) {
        connectedUsers.delete(socket.id);
        // Check if user still has other connections
        let hasOtherConnections = false;
        for (const conn of connectedUsers.values()) {
          if (conn.user.id === currentUserId) {
            hasOtherConnections = true;
            break;
          }
        }
        if (!hasOtherConnections) {
          dbService.setUserStatus(currentUserId, 'offline');
          io.emit('user:presence', {
            userId: currentUserId,
            status: 'offline',
            activeCount: connectedUsers.size,
          });
        }
      }
    });
  });
}
