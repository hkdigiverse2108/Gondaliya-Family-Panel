import React, { createContext, useContext, useState } from 'react';

interface User {
  _id: string;
  phoneNumber: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('admin-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('admin-token');
  });

  const login = (newToken: string, newUser: User) => {
    if (newUser.role !== 'admin') {
      throw new Error('Access denied. Only administrators are allowed to access this panel.');
    }
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('admin-token', newToken);
    localStorage.setItem('admin-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
  };

  const isAuthenticated = !!token && user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
