import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Higher-Order Component (Route Guard) for protecting routes
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, isLoggedIn } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Verifying access...</div>
      </div>
    );
  }

  // If not logged in, redirect to home page
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  // If no user data available, redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If specific roles are required, check if user has at least one of them
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // User is logged in and has required permissions
  return children;
};

export default ProtectedRoute;
