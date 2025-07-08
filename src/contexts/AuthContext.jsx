import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setupAuthInterceptors } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // Helper function to get current token
  const getToken = () => {
    const storedToken = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!storedToken || !expiry) return null;

    // Check if token expired
    if (Date.now() >= parseInt(expiry)) {
      logout();
      return null;
    }

    return storedToken;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const expiry = localStorage.getItem('token_expiry');

      if (!storedToken || !expiry) {
        setLoading(false);
        return;
      }

      // Check if token expired
      if (Date.now() >= parseInt(expiry)) {
        logout();
        return;
      }

      setToken(storedToken);

      // Fetch user details from API
      try {
        const response = await api.get('/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        // If token is invalid, logout
        if (error.response?.status === 401) {
          logout();
        }
      }

      setLoading(false);
    };

    // Setup API interceptors with the context's getToken function
    setupAuthInterceptors(getToken, logout);
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;

      // Store only token and expiry in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
      setToken(data.access_token);

      // Fetch user details and store in memory
      // Create a new API instance with the token to ensure it's sent
      const userResponse = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      setUser(userResponse.data);

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = async () => {
    // Prevent multiple logout calls
    if (!localStorage.getItem('access_token')) {
      window.location.href = '/landing';
      return;
    }

    try {
      // Get the current token
      const currentToken = localStorage.getItem('access_token');
      if (currentToken) {
        // Call backend logout endpoint
        await api.post('/auth/logout', null, {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expiry');
      
      // Clear memory state
      setToken(null);
      setUser(null);
      
      // Redirect to landing page
      window.location.href = '/landing';
    }
  };

  const isLoggedIn = () => {
    const storedToken = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!storedToken || !expiry) return false;

    // Check if token expired
    if (Date.now() >= parseInt(expiry)) {
      logout();
      return false;
    }

    return true;
  };

  // Helper functions for user data
  const getUserEmail = () => user?.email || null;
  const getUserRole = () => user?.roles?.[0] || null;
  const getUserRoleName = () => {
    const role = getUserRole();
    const roleNames = {
      'R01': 'System Administrator',
      'R02': 'Executive',
      'R03': 'Head Office-Level Checker',
      'R04': 'Site-Level Checker',
      'R05': 'Encoder'
    };
    return roleNames[role] || role || 'User';
  };
  const getUserCompanyId = () => user?.company_id || null;
  const getUserPowerPlantId = () => user?.power_plant_id || null;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isLoggedIn,
    getUserEmail,
    getUserRole,
    getUserRoleName,
    getUserCompanyId,
    getUserPowerPlantId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 