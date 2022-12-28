import { Directory } from '../types/index';

const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function getDirectories(includeSops=true): Promise<Array<any>> {
  let res = await fetch(`${BASE_URL}/directory?include_sops=${includeSops}`);
  if (!res.ok) {
    try {
      res = await fetch(`${BASE_URL}/directory?include_sops=false`);
    }
    catch {
      throw new Error(res.statusText);
    }
  }
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  
  const directories: Array<any> = await res.json();
  return directories;
};

export async function createDirectories(directory: Directory): Promise<void> {
  const res = await fetch(`${BASE_URL}/directory/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(directory),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

export async function getSops(id: number): Promise<Array<any>> {
  const res = await fetch(`${BASE_URL}/directory/getSops/${id}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const directories: Array<any> = await res.json();
  return directories;
}


export async function deleteDirectory(id): Promise<Boolean> {
  const res = await fetch(`${BASE_URL}/directory/${id}`, {
    method: 'DELETE',
    },
  );

  return true;
};
