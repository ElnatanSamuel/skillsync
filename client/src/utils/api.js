import axios from "axios";

// Get the API URL from environment or use production URL
const apiUrl =
  import.meta.env.VITE_API_URL || "https://skillsync-server.vercel.app/api";

// Create a custom instance of axios
const api = axios.create({
  baseURL: apiUrl,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Helper function for authenticated fetch requests
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const baseUrl = apiUrl.replace("/api", "");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

// Session endpoints
export const createSession = (sessionData) =>
  api.post("/sessions", sessionData);
export const getSessions = () => api.get("/sessions");
export const getSessionById = (id) => api.get(`/sessions/${id}`);
export const updateSession = (id, sessionData) =>
  api.put(`/sessions/${id}`, sessionData);
export const deleteSession = (id) => api.delete(`/sessions/${id}`);

// Goal endpoints
export const createGoal = (goalData) => api.post("/goals", goalData);
export const getGoals = () => api.get("/goals");
export const getGoalById = (id) => api.get(`/goals/${id}`);
export const updateGoal = (id, goalData) => api.put(`/goals/${id}`, goalData);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

// Auth endpoints
export const login = (credentials) => api.post("/auth/login", credentials);
export const register = (userData) => api.post("/auth/register", userData);
export const verifyToken = () => api.get("/auth/verify");

export default api;
