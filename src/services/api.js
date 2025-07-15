import axios from "axios";

// Global state to prevent multiple logout calls
let isLoggingOut = false;

const api = axios.create({
  baseURL: "http://10.1.1.190:8000", // Your FastAPI backend URL
  // baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to setup auth interceptors (called from auth.js to avoid circular imports)
export const setupAuthInterceptors = (getToken, logout) => {
  // Add auth token to all requests
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle response errors and session activity
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If we're already logging out, don't process 401 errors
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      // If error is 401 and it's not a login request, logout request, or activity update request
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/token") && // Don't logout on login failures
        !originalRequest.url.includes("/auth/logout") && // Don't logout on logout failures
        !originalRequest.url.includes("/auth/update-activity") // Don't logout on activity update failures
      ) {
        originalRequest._retry = true;

        // Set logout flag to prevent race conditions
        isLoggingOut = true;

        try {
          // Try to update session activity
          const response = await api.post("/auth/update-activity");

          if (response.data.valid) {
            // Reset logout flag if session is valid
            isLoggingOut = false;
            // Retry the original request
            return api(originalRequest);
          } else {
            // Session is invalid, logout
            logout();
          }
        } catch (refreshError) {
          console.error("[API] Session activity update failed:", refreshError);
          // If update activity fails, logout
          logout();
        }

        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
};

// Function to reset logout state (called from AuthContext after successful login)
export const resetLogoutState = () => {
  isLoggingOut = false;
};

export default api;
