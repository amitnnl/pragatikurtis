// frontend/src/utils/authFetch.js
import { API_BASE_URL } from '../config';

const getAuthToken = () => {
  return localStorage.getItem('jwt');
};

const authFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized responses globally
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    
    // Redirect to login and save the current path to return to after login
    const currentPath = window.location.pathname + window.location.search;
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }

  return response;
};

export default authFetch;
