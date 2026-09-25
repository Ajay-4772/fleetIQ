import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  switchRole: (roleKey: 'admin' | 'ops_lead' | 'operator' | 'viewer') => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<string, { username: string; pass: string }> = {
  admin: { username: 'admin', pass: 'Admin@FleetIQ2026' },
  ops_lead: { username: 'ops_lead', pass: 'Ops@FleetIQ2026' },
  operator: { username: 'operator', pass: 'Operator@FleetIQ2026' },
  viewer: { username: 'viewer', pass: 'Viewer@FleetIQ2026' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initial bootstrap: load user if token exists, or auto-login as ops_lead for demo
    if (token) {
      api
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          // If token expired, auto-login with default demo lead
          autoLoginDemo('ops_lead');
        });
    } else {
      autoLoginDemo('ops_lead');
    }
  }, []);

  const autoLoginDemo = async (roleKey: 'admin' | 'ops_lead' | 'operator' | 'viewer') => {
    const cred = DEMO_CREDENTIALS[roleKey];
    try {
      const res = await api.login(cred.username, cred.pass);
      setTokenState(res.token);
      setUser({
        username: res.username,
        fullName: res.fullName,
        role: res.role
      });
    } catch (e) {
      console.warn('Auto-login error:', e);
    }
  };

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.login(username, password);
    setTokenState(res.token);
    setUser({
      username: res.username,
      fullName: res.fullName,
      role: res.role
    });
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const switchRole = async (roleKey: 'admin' | 'ops_lead' | 'operator' | 'viewer') => {
    await autoLoginDemo(roleKey);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const required = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.role === required || user.role === 'ROLE_ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        switchRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
