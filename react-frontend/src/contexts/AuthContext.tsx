import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  register: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { username, password, role });
      const response = await api.post('/auth/login', { username, password });
      console.log('Login response:', response.data);
      const { access_token, role: userRole } = response.data;
      
      if (userRole !== role) {
        console.error('Role mismatch:', userRole, 'expected:', role);
        return false;
      }
      
      const userData = { id: 0, username, role: userRole }; // ID will be set by backend
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login successful, user set:', userData);
      return true;
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          console.error('Invalid credentials');
        } else if (axiosError.response) {
          console.error('Server error:', axiosError.response.status, axiosError.response.data);
        }
      } else if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as any;
        if (networkError.code === 'ECONNREFUSED') {
          console.error('Backend server not running');
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as any;
        console.error('Network error:', messageError.message);
      }
      return false;
    }
  };

  const register = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      await api.post('/auth/register', { username, password, role });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
