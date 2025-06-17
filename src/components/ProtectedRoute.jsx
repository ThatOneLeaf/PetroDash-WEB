import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/auth";

// Higher-Order Component (Route Guard) for protecting routes
const ProtectedRoute = ({ children }) => {
  // If user is logged in, render the children (protected component)
  // If not logged in, redirect to home page
  return isLoggedIn() ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
