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
    const hadToken = !!token;
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    // Only redirect if user was logged in (session expired), not for anonymous requests
    if (hadToken) {
      window.location.href = '/login';
    }
  }

  return response;
};

export default authFetch;
