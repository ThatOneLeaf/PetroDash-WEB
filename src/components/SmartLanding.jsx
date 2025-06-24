import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SmartLanding = () => {
  const { user, loading, isLoggedIn, getUserRole } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not logged in, show the main landing page
  if (!isLoggedIn() || !user) {
    return <Navigate to="/landing" replace />;
  }

  // Get user role and determine where to redirect
  const userRole = getUserRole();
    // Role-based navigation logic based on access patterns from Sidebar
  const getDefaultRoute = (role) => {
    switch (role) {
      case 'R02': // Executive - Dashboard only
        return '/dashboard';
      case 'R03': // Head Office-Level Checker - Both modes, default to dashboard
      case 'R04': // Site-Level Checker - Both modes, default to dashboard
        return '/dashboard';
      case 'R05': // Encoder - Repository only, find first accessible repository page
        // Priority order: Economic (most common) -> Energy -> Environment -> Social
        const r05Routes = [
          '/economic/repository',
          '/energy/power-generation',
          '/environment/energy',
          '/environment/water',
          '/social/hr'
        ];
        return r05Routes[0]; // Default to economic repository
      default:
        // Default fallback - try dashboard first
        return '/dashboard';
    }
  };

  const defaultRoute = getDefaultRoute(userRole);
  
  return <Navigate to={defaultRoute} replace />;
};

export default SmartLanding;
