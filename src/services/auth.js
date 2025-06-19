// Simplified Authentication Service - Works with AuthContext
import api, { setupAuthInterceptors } from "./api";

const AUTH_API_URL = "http://localhost:8000/auth";

// Token management functions (only tokens stored in localStorage)
export const getToken = () => {
  const token = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("token_expiry");

  if (!token || !expiry) return null;

  // Check if token expired
  if (Date.now() >= parseInt(expiry)) {
    clearAuthData();
    return null;
  }

  return token;
};

export const setAuthData = (token, expiresIn) => {
  localStorage.setItem("access_token", token);
  localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
};

export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expiry");
  // Remove legacy user_details if it exists
  localStorage.removeItem("user_details");
};

export const isLoggedIn = () => {
  return getToken() !== null;
};

// API functions
export const loginAPI = async (email, password) => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  try {
    const response = await api.post("/auth/token", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Login failed");
  }
};

export const fetchUserDetails = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication expired");
    }
    throw new Error(error.response?.data?.detail || "Failed to fetch user details");
  }
};

// Legacy logout function for components that still use it directly
export const logout = () => {
  clearAuthData();
  window.location.href = "/";
};

// Setup API interceptors with the token getter and logout function
setupAuthInterceptors(getToken, logout);
