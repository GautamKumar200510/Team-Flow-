import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeOnlineCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeOnlineCount, setActiveOnlineCount] = useState<number>(1);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io({
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user) {
        newSocket.emit('user:join', {
          id: user.id,
          name: user.name,
          email: user.email,
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user:presence', (data: { userId: string; status: string; activeCount?: number }) => {
      if (data.activeCount !== undefined) {
        setActiveOnlineCount(data.activeCount);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('user:join', {
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }
  }, [user, socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeOnlineCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
