import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // The proxy will handle the redirect to the backend
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
