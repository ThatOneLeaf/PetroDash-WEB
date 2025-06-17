// Simple Authentication Service
const AUTH_API_URL = "http://localhost:8000/auth";

// Simple auth functions
export const login = async (email, password) => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${AUTH_API_URL}/token`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await response.json();

  // Store token and expiry time
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);

  // Start checking for expiration
  startTokenMonitoring();

  return data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expiry");
  stopTokenMonitoring();

  // Redirect to home
  window.location.href = "/";
};

export const isLoggedIn = () => {
  const token = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("token_expiry");

  if (!token || !expiry) return false;

  // Check if token expired
  if (Date.now() >= parseInt(expiry)) {
    logout(); // Auto logout if expired
    return false;
  }

  return true;
};

export const getToken = () => {
  return isLoggedIn() ? localStorage.getItem("access_token") : null;
};

// Simple token monitoring
let monitorInterval = null;

const startTokenMonitoring = () => {
  stopTokenMonitoring(); // Clear any existing interval

  monitorInterval = setInterval(() => {
    if (!isLoggedIn()) {
      // This will auto-logout and redirect if token expired
      return;
    }
  }, 1000); // Check every second
};

const stopTokenMonitoring = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
};

// Start monitoring if already logged in when page loads
if (isLoggedIn()) {
  startTokenMonitoring();
}
