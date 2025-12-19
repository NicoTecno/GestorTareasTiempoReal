import api from './axios';

export const loginRequest = async (credentials: { email: string; password: string }) => {
  const res = await api.post('/auth/login', credentials);
  // Guardamos en el navegador para que no se borre al refrescar
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/'; // Redirige y limpia la app
};