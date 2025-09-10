import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for demo
const mockUsers: Record<string, User> = {
  'company@demo.com': {
    id: '1',
    name: 'Sarah Johnson',
    email: 'company@demo.com',
    role: 'company',
    companyId: 'comp-1',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b96db0d5?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
  'manager@demo.com': {
    id: '2',
    name: 'Michael Chen',
    email: 'manager@demo.com',
    role: 'manager',
    companyId: 'comp-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
  'employee@demo.com': {
    id: '3',
    name: 'Emma Williams',
    email: 'employee@demo.com',
    role: 'employee',
    companyId: 'comp-1',
    managerId: '2',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('scheduler_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email.toLowerCase()];
    if (mockUser && password === 'demo123') {
      setUser(mockUser);
      localStorage.setItem('scheduler_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Default to company role for Google sign-in demo
    const googleUser = mockUsers['company@demo.com'];
    setUser(googleUser);
    localStorage.setItem('scheduler_user', JSON.stringify(googleUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scheduler_user');
  };

  // For demo purposes - allow role switching
  const switchRole = (role: UserRole) => {
    if (!user) return;
    
    const roleUser = Object.values(mockUsers).find(u => u.role === role);
    if (roleUser) {
      setUser(roleUser);
      localStorage.setItem('scheduler_user', JSON.stringify(roleUser));
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    isLoading,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}