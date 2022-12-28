import { User } from '../types/index';

const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function preregisterUser(credentials): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/preregister`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

export async function registerUser(credentials): Promise<Response> {
  console.log(credentials);
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });
  return res;
}

export async function login(credentials): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const { token, user } = await res.json();
  window.localStorage.setItem('accessToken', token);
  window.localStorage.setItem('username', user.name);
  window.localStorage.setItem('id', user.id);
  window.localStorage.setItem('email', user.email);
  window.localStorage.setItem('isAdmin', `${user.privilege === 1}`);
}
