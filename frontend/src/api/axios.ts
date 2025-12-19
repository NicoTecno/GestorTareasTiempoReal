import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:3000',
  baseURL: 'https://taskflow-api-2hgn.onrender.com',
});

// Interceptor para adjuntar el Token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;