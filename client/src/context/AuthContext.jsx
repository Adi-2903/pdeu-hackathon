import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Set default header for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const payloadStr = atob(token.split('.')[1]);
          const payload = JSON.parse(payloadStr);
          // Check expiry
          if (payload.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser(payload.user);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Network error. Make sure the backend is running.' };
    }
  };

  const logout = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    sessionStorage.removeItem('hasSeenSplash');
    setToken(null);
    setUser(null);
    // Force a full page reload to trigger the app splash animation
    window.location.href = '/login';
  };

  const value = { user, token, login, logout, isAuthenticated: !!token, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
