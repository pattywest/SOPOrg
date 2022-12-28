import { User } from '../types/index';

const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function getUser(id): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const user: User = await res.json();
  return user;
}

export async function getUsers(): Promise<Array<User>> {
  const res = await fetch(`${BASE_URL}/users/`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const users: Array<User> = await res.json();
  return users;
}

export async function updateUserPriv(user_id: Number, user: User): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${user_id}`,{
    method: 'PATCH',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if(!res.ok){
    throw new Error(res.statusText);
  }
}

export async function deleteUser(credentials): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/`, {
    method: 'DELETE',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}