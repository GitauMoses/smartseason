import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartseason_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login') {
        localStorage.removeItem('smartseason_token');
        localStorage.removeItem('smartseason_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function apiError(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong'
  );
}

export default client;
