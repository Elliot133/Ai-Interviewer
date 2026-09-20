import { api } from './api';

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function googleAuth(idToken) {
  const { data } = await api.post('/auth/google', { idToken });
  return data;
}

export async function googleRegister(idToken) {
  const { data } = await api.post('/auth/google/register', { idToken });
  return data;
}
