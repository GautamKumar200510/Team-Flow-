import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; bio?: string }) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('teamflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('teamflow_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('teamflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const handleAuthSuccess = (res: AuthResponse, msg: string) => {
    localStorage.setItem('teamflow_token', res.token);
    setToken(res.token);
    setUser(res.user);
    success(msg, 'Welcome to TeamFlow');
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.login(credentials);
      handleAuthSuccess(res, `Logged in as ${res.user.name}`);
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please verify your credentials.');
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; bio?: string }) => {
    try {
      const res = await api.register(data);
      handleAuthSuccess(res, `Account created for ${res.user.name}`);
    } catch (err: any) {
      toastError(err.message || 'Registration failed. Please check form inputs.');
      throw err;
    }
  };

  const demoLogin = async (email: string) => {
    try {
      const res = await api.login({ email, password: 'password123' });
      handleAuthSuccess(res, `Logged in as ${res.user.name} (Demo)`);
    } catch (err: any) {
      toastError(err.message || 'Demo login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('teamflow_token');
    setToken(null);
    setUser(null);
    success('You have been logged out securely.', 'Logged Out');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await api.updateProfile(data);
      setUser(res.user);
      success(res.message || 'Profile updated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const updatePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await api.updatePassword(passwords);
      success(res.message || 'Password changed successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to change password.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
