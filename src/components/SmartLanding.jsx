import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * SmartLanding Component
 * 
 * Handles role-based landing navigation after login:
 * - R02 (Executive): Dashboard access only → Overview Dashboard (/dashboard)
 * - R03 (Head Office-Level Checker): Both dashboard and repository access → Overview Dashboard (/dashboard)
 * - R04 (Site-Level Checker): Both dashboard and repository access → Overview Dashboard (/dashboard)
 * - R05 (Encoder): Repository access only → Energy Repository (/energy/power-generation)
 */
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
  // Role-based navigation logic based on access patterns from App.jsx routes
  const getDefaultRoute = (role) => {
    switch (role) {
      case 'R02': // Executive - Dashboard access only
        // R02 has access to dashboard overview, so land on overview dashboard
        return '/dashboard';
        
      case 'R03': // Head Office-Level Checker - Both dashboard and repository access
      case 'R04': // Site-Level Checker - Both dashboard and repository access
        // R03/R04 have access to dashboards, so land on overview dashboard
        return '/dashboard';
        
      case 'R05': // Encoder - Repository access only
        // R05 has no dashboard access, so land on energy repository (power-generation)
        return '/energy/power-generation';
        
      default:
        // Default fallback - try dashboard first
        return '/dashboard';
    }
  };

  const defaultRoute = getDefaultRoute(userRole);
  
  return <Navigate to={defaultRoute} replace />;
};

export default SmartLanding;
