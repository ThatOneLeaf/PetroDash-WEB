import axios from "axios";

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

      // If error is 401 and it's not an activity update request
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/update-activity")
      ) {
        originalRequest._retry = true;

        try {
          // Try to update session activity
          const response = await api.post("/auth/update-activity");

          if (response.data.valid) {
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("[API] Session activity update failed:", refreshError);
        }

        // If session verification failed, logout
        logout();
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
};

export default api;
