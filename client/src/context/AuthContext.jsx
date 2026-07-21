/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session: Attempt silently refreshing token using cookie
  const initializeSession = useCallback(async () => {
    try {
      const refreshResult = await authService.refresh();
      if (refreshResult.success && refreshResult.data.accessToken) {
        setAccessTokenState(refreshResult.data.accessToken);
        
        const profileResult = await authService.getCurrentUser();
        if (profileResult.success && profileResult.data.user) {
          setCurrentUser(profileResult.data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (_) {
      // Silently catch - user remains a guest
      setCurrentUser(null);
      setAccessTokenState('');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.data.accessToken) {
        setAccessTokenState(result.data.accessToken);
        setCurrentUser(result.data.user);
        setIsAuthenticated(true);
        return result.data;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (_) {
      // Even if network request fails, clear local states to guarantee safety
    } finally {
      setCurrentUser(null);
      setAccessTokenState('');
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const result = await authService.refresh();
      if (result.success && result.data.accessToken) {
        setAccessTokenState(result.data.accessToken);
        setIsAuthenticated(true);
        return result.data.accessToken;
      }
    } catch (err) {
      // Invalidation event (refresh token expired) -> force logout state
      setCurrentUser(null);
      setAccessTokenState('');
      setIsAuthenticated(false);
      throw err;
    }
  };

  const value = {
    currentUser,
    accessToken,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshSession,
    initializeSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
