import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend URL
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

  // Auto logout on 401 errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('[API INTERCEPTOR] Response error:', error.response?.status, 'for URL:', error.config?.url);
      if (error.response?.status === 401) {
        console.log('[API INTERCEPTOR] 401 error, logging out');
        logout();
      }
      return Promise.reject(error);
    }
  );
};

export default api;
