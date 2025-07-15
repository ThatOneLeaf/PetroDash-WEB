import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setupAuthInterceptors, resetLogoutState } from '../services/api';

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

      // Reset logout state on successful login
      resetLogoutState();

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
    // Prevent multiple logout calls - check if already cleared
    if (!localStorage.getItem('access_token')) {
      // If already logged out, just ensure we're on the landing page
      if (window.location.pathname !== '/landing') {
        window.location.href = '/landing';
      }
      return;
    }

    // Get the current token before clearing
    const currentToken = localStorage.getItem('access_token');

    // Clear localStorage and state IMMEDIATELY
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
    setToken(null);
    setUser(null);

    // Redirect IMMEDIATELY to prevent more API calls
    window.location.href = '/landing';

    // Optionally try to call backend logout endpoint (non-blocking)
    // This is best effort - if it fails, the user is still logged out locally
    if (currentToken) {
      try {
        // Use a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timeout')), 3000)
        );

        Promise.race([
          api.post('/auth/logout', null, {
            headers: {
              'Authorization': `Bearer ${currentToken}`
            }
          }),
          timeoutPromise
        ]).catch(error => {
          // Silent fail - user is already logged out locally
          console.error('Backend logout failed (non-critical):', error);
        });
      } catch (error) {
        // Silent fail - user is already logged out locally
        console.error('Backend logout failed (non-critical):', error);
      }
    }
  };

  const isLoggedIn = () => {
    const storedToken = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!storedToken || !expiry) return false;

    // Just check if token is valid - don't trigger logout here
    // Let the API interceptor handle expired tokens
    return Date.now() < parseInt(expiry);
  };

  // Check if token exists but is expired (for cleanup purposes)
  const isTokenExpired = () => {
    const storedToken = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!storedToken || !expiry) return false;

    return Date.now() >= parseInt(expiry);
  };

  // Clean up expired tokens periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (isTokenExpired()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

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