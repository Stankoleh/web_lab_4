import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:3001/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export const getErrorText = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Request failed';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
};

export default api;
