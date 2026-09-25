import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResponse, AuthTokensResponse, RegisterRequest, ResetPasswordRequest } from '../types';
import { api, setAuthToken, getAuthToken, getRefreshToken } from '../services/api';

export type AuthStatus =
  | 'IDLE'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'ERROR';

interface AuthContextType {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterRequest) => Promise<AuthTokensResponse>;
  forgotPassword: (email: string) => Promise<{ message: string; status: string }>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<{ message: string; status: string }>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role to permissions mapping matrix
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ROLE_ADMIN: [
    'USER_READ', 'USER_CREATE', 'USER_STATUS_UPDATE', 'ROLE_ASSIGN', 'AUDIT_READ',
    'SYSTEM_HEALTH_READ', 'VEHICLE_READ', 'VEHICLE_EXPORT', 'ACTION_READ', 'ACTION_UPDATE',
    'ACTION_EXPORT', 'TELEMETRY_STREAM_READ', 'TELEMETRY_INGEST', 'COPILOT_USE', 'SIMULATOR_EXECUTE'
  ],
  ROLE_OPERATIONS_LEAD: [
    'SYSTEM_HEALTH_READ', 'VEHICLE_READ', 'VEHICLE_EXPORT', 'ACTION_READ', 'ACTION_UPDATE',
    'ACTION_EXPORT', 'TELEMETRY_STREAM_READ', 'TELEMETRY_INGEST', 'COPILOT_USE', 'SIMULATOR_EXECUTE'
  ],
  ROLE_OPERATOR: [
    'SYSTEM_HEALTH_READ', 'VEHICLE_READ', 'VEHICLE_EXPORT', 'ACTION_READ', 'ACTION_UPDATE',
    'ACTION_EXPORT', 'TELEMETRY_STREAM_READ', 'COPILOT_USE'
  ],
  ROLE_VIEWER: [
    'SYSTEM_HEALTH_READ', 'VEHICLE_READ', 'VEHICLE_EXPORT', 'ACTION_READ',
    'ACTION_EXPORT', 'TELEMETRY_STREAM_READ', 'COPILOT_USE'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setStatus('IDLE');
    setUser(null);
    setTokenState(null);
    setAuthToken(null, null);
    api.logout().catch(() => {});
  }, []);

  const handleAuthError = (err: any) => {
    const msg = err.message || '';
    if (msg.includes('423') || msg.includes('locked')) {
      setStatus('ACCOUNT_LOCKED');
      setError('Account is temporarily locked due to repeated failed login attempts. Please retry later or contact your administrator.');
    } else if (msg.includes('403') || msg.includes('disabled') || msg.includes('deactivated')) {
      setStatus('ACCOUNT_DISABLED');
      setError('Account has been deactivated. Please contact your FleetIQ Administrator.');
    } else if (msg.includes('401') || msg.includes('BAD_CREDENTIALS') || msg.includes('credentials')) {
      setStatus('ERROR');
      setError('Invalid username or password. Please verify your corporate credentials.');
    } else if (msg.includes('429')) {
      setStatus('ERROR');
      setError('Rate limit exceeded. Please wait a moment before retrying.');
    } else {
      setStatus('ERROR');
      setError(msg || 'Authentication service error. Please retry.');
    }
  };

  useEffect(() => {
    // Check if an existing valid JWT token is stored
    if (token) {
      api
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setStatus('AUTHENTICATED');
        })
        .catch(async () => {
          // Try refreshing token using stored refresh token
          const refreshed = await api.refreshToken();
          if (refreshed) {
            setTokenState(refreshed);
            try {
              const freshUser = await api.getCurrentUser();
              setUser(freshUser);
              setStatus('AUTHENTICATED');
            } catch {
              logout();
            }
          } else {
            logout();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setStatus('AUTHENTICATING');
    setError(null);
    try {
      const res = await api.login(username, password);
      setTokenState(res.token);
      setUser({
        username: res.username,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        organization: res.organization
      });
      setStatus('AUTHENTICATED');
      return res;
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    }
  };

  const register = async (payload: RegisterRequest): Promise<AuthTokensResponse> => {
    setStatus('AUTHENTICATING');
    setError(null);
    try {
      const res = await api.register(payload);
      setTokenState(res.accessToken || res.token);
      setUser({
        username: res.username,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        organization: res.organization
      });
      setStatus('AUTHENTICATED');
      return res;
    } catch (err: any) {
      setStatus('ERROR');
      setError(err.message || 'Registration failed. Please verify submitted details.');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      return await api.forgotPassword(email);
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
      throw err;
    }
  };

  const resetPassword = async (payload: ResetPasswordRequest) => {
    setError(null);
    try {
      return await api.resetPassword(payload);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Invalid or expired token.');
      throw err;
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const required = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.role === required || user.role === 'ROLE_ADMIN';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission) || user.role === 'ROLE_ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        clearError,
        hasRole,
        hasPermission
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
