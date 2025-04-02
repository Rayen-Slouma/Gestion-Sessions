import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set Auth Token
  const setAuthToken = useCallback((token: string) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        setAuthToken(localStorage.getItem('token') as string);
        
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`);
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [setAuthToken]);

  // Login user
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (res.data.success && res.data.token) {
        setAuthToken(res.data.token);
        
        const userRes = await axios.get(`${API_URL}/api/auth/me`);
        setUser(userRes.data.data);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [setAuthToken]);

  // Logout
  const logout = useCallback(() => {
    setAuthToken('');
    setIsAuthenticated(false);
    setUser(null);
  }, [setAuthToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
