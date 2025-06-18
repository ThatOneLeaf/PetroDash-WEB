import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/auth";
import api from "../services/api";

// Higher-Order Component (Route Guard) for protecting routes
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const [userRoles, setUserRoles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }

      try {
        // Get current user info including roles
        const response = await api.get("/auth/me");
        setUserRoles(response.data.roles || []);
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError("Failed to verify user permissions");
      } finally {
        setLoading(false);
      }
    };

    checkUserRoles();
  }, []);

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

  // If there was an error getting user info, redirect to home
  if (error) {
    console.error("ProtectedRoute error:", error);
    return <Navigate to="/" replace />;
  }

  // If specific roles are required, check if user has at least one of them
  if (requiredRoles.length > 0 && userRoles) {
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
