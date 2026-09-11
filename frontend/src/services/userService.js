import { api } from './api';

export async function getCurrentUser() {
  const { data } = await api.get('/users/me');
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload);
  return data;
}

export async function changePassword(payload) {
  await api.put('/profile/password', payload);
}
