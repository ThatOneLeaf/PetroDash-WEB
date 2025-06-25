import axios from "axios";

const api = axios.create({
  baseURL: "http://10.1.1.190:8000", // Your FastAPI backend URL
  //baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to setup auth interceptors (called from auth.js to avoid circular imports)
export const setupAuthInterceptors = (getToken, logout) => {
  // Add auth token to all requests
  api.interceptors.request.use((config) => {
    const token = getToken();
    console.log('[API INTERCEPTOR] Request to:', config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Log response errors for debugging (no auto-logout - let ProtectedRoute handle auth)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('[API INTERCEPTOR] Response error:', error.response?.status, 'for URL:', error.config?.url);
      // Let ProtectedRoute component handle authentication redirects
      // No auto-logout here to avoid disrupting user experience
      return Promise.reject(error);
    }
  );
};

export default api;
