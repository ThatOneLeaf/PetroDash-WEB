import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, Typography, Paper } from "@mui/material";

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

  // If no user data available, redirect to home (authentication issue)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If specific roles are required, check if user has at least one of them
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // User doesn't have required role - show access denied message instead of redirecting
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2
          }}
        >
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Typography variant="h5" sx={{ color: '#d32f2f', mb: 2, fontWeight: 'bold' }}>
              Access Denied
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
              You don't have permission to access this page.
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Required roles: {requiredRoles.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Your role: {userRoles.join(', ') || 'None'}
            </Typography>
          </Paper>
        </Box>
      );
    }
  }

  // User is logged in and has required permissions
  return children;
};

export default ProtectedRoute;
