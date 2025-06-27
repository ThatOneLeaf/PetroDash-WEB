// Simplified Authentication Service - Works with AuthContext
import api, { setupAuthInterceptors } from "./api";

const AUTH_API_URL = "http://localhost:8000/auth";

// Activity tracking
let activityTimeout = null;
const ACTIVITY_CHECK_INTERVAL = 10000; // Check every 10 seconds

// Token management functions
export const getToken = () => {
  const token = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("token_expiry");
  const absoluteExpiry = localStorage.getItem("absolute_expiry");

  if (!token || !expiry || !absoluteExpiry) return null;

  // Check if token has absolutely expired
  if (Date.now() >= parseInt(absoluteExpiry)) {
    clearAuthData();
    return null;
  }

  return token;
};

export const setAuthData = (token, expiresIn, absoluteExpiry) => {
  localStorage.setItem("access_token", token);
  localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
  localStorage.setItem("absolute_expiry", absoluteExpiry * 1000);
  startActivityTracking();
};

export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expiry");
  localStorage.removeItem("absolute_expiry");
  stopActivityTracking();
};

// Activity tracking functions
export const startActivityTracking = () => {
  // Clear any existing tracking
  stopActivityTracking();

  // Set up activity listeners
  const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  activityEvents.forEach((event) => {
    document.addEventListener(event, handleUserActivity);
  });

  // Start periodic activity checks
  activityTimeout = setInterval(checkSessionActivity, ACTIVITY_CHECK_INTERVAL);
};

export const stopActivityTracking = () => {
  const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  activityEvents.forEach((event) => {
    document.removeEventListener(event, handleUserActivity);
  });

  if (activityTimeout) {
    clearInterval(activityTimeout);
    activityTimeout = null;
  }
};

const handleUserActivity = async () => {
  const token = getToken();
  if (token) {
    try {
      await updateSessionActivity();
    } catch (error) {
      // Silent fail for user activity updates
    }
  }
};

const checkSessionActivity = async () => {
  const token = getToken();
  if (token) {
    try {
      await updateSessionActivity();
    } catch (error) {
      console.error("[Auth] Session verification failed:", error);
      clearAuthData();
      window.location.href = "/";
    }
  }
};

export const updateSessionActivity = async () => {
  try {
    const response = await api.post("/auth/update-activity");
    return response.data;
  } catch (error) {
    throw error;
  }
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

    const { access_token, expires_in, absolute_expiry } = response.data;
    setAuthData(access_token, expires_in, absolute_expiry);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Login failed");
  }
};

export const logoutAPI = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("[Auth] Logout failed:", error);
  } finally {
    clearAuthData();
    window.location.href = "/";
  }
};

// Setup API interceptors with the token getter and logout function
setupAuthInterceptors(getToken, logoutAPI);
