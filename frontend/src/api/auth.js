import client from './client';

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function me() {
  const { data } = await client.get('/auth/me');
  return data.data.user;
}
