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
    // Optionally clear token and redirect to login
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  }

  return response;
};

export default authFetch;
