import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  studentId?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isNurse: () => boolean;
  isStudentAssistant: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get initial auth state from localStorage
const getInitialAuthState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      const userData = JSON.parse(storedUser);
      return {
        user: userData,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error reading auth state from localStorage:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }
  
  return {
    user: null,
    isAuthenticated: false,
  };
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  super_admin: [
    'create_users', 'delete_users', 'view_all_requests', 'manage_inventory',
    'create_announcements', 'view_reports', 'manage_system', 'manage_admins',
    'system_configuration', 'database_management', 'audit_logs'
  ],
  admin: [
    'create_users', 'delete_users', 'view_all_requests', 'manage_inventory',
    'create_announcements', 'view_reports', 'manage_system'
  ],
  nurse: [
    'view_requests', 'update_request_status', 'manage_inventory', 
    'view_announcements', 'view_reports'
  ],
  student_assistant: [
    'view_requests', 'create_requests', 'view_announcements'
  ]
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage immediately (synchronously)
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
  const [isLoading] = useState(false);

  // Verify localStorage integrity on mount (safety check)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    // If localStorage has invalid data, clean it up
    if (storedUser && storedAuth === 'true') {
      try {
        JSON.parse(storedUser); // Just verify it's valid JSON
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []); // Only run once on mount

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  // Role checking functions
  const isSuperAdmin = () => user?.role === 'super_admin';
  const isAdmin = () => user?.role === 'admin';
  const isNurse = () => user?.role === 'nurse';
  const isStudentAssistant = () => user?.role === 'student_assistant';

  const hasPermission = (permission: string) => {
    if (!user || !user.role) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      isSuperAdmin,
      isAdmin,
      isNurse,
      isStudentAssistant,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

