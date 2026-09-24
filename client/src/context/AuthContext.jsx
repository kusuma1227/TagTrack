import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMyProfile } from '../api/authApi';

/**
 * AuthContext — Global authentication state
 *
 * Provides:
 *  - user: current user object (or null)
 *  - token: JWT string (or null)
 *  - isLoading: true while checking stored token on app load
 *  - login(token, user): stores credentials and updates state
 *  - logout(): clears credentials and state
 *  - updateUser(userData): updates user object in state (after profile edit)
 */
export const AuthContext = createContext(null);

const TOKEN_KEY = 'tagtrack_token';
const USER_KEY = 'tagtrack_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by fetching current profile
          setToken(storedToken);
          const data = await getMyProfile();
          setUser(data.data.user);
        } catch {
          // Token invalid or expired — clear everything
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...userData }));
  }, [user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
