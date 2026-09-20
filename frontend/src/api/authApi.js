import api from './axios';

export async function registerUser(userData) {
  const response = await api.post(
    '/api/auth/register',
    userData
  );

  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post(
    '/api/auth/login',
    credentials
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/api/auth/me');

  return response.data;
}