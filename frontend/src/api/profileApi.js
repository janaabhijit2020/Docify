import api from './axios';

export async function updateProfile(name) {
  const response = await api.put('/api/auth/profile', {
    name,
  });

  return response.data;
}

export async function changePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  const response = await api.put('/api/auth/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });

  return response.data;
}