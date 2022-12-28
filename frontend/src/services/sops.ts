import { Directory, SOP } from '../types/index';

const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function getSOPs(): Promise<Array<SOP>> {
  const res = await fetch(`${BASE_URL}/sops/?include_documents=true`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const documents: Array<SOP> = await res.json();
  return documents;
}

export async function getSOP(id): Promise<SOP> {
  const res = await fetch(`${BASE_URL}/sops/${id}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const sop: SOP = await res.json();
  return sop;
}

export async function createSOP(sop: SOP): Promise<void> {
  const res = await fetch(`${BASE_URL}/sops/`, {
    method: 'POST',
    body: JSON.stringify(sop),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

export async function changeDirectory(
  sop_id: Number,
  oldDirectory: Directory,
  newDirectory: Directory
): Promise<void> {
  const body = {
    sop_id,
    oldDirectory,
    newDirectory,
  };
  console.log(`Body: ${body}`);
  const res = await fetch(`${BASE_URL}/sops/changeDirectory`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

export async function rename(
  sop_id: Number,
  sop: SOP,
  newName: String
): Promise<void> {
  sop.name = newName;
  console.log(`${sop_id}`);
  console.log(`${JSON.stringify(sop)}`);
  const res = await fetch(`${BASE_URL}/sops/${sop_id}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sop),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
};

export async function getAllSOPsWithContent(content: String): Promise<Array<SOP>> {
  const res = await fetch(`${BASE_URL}/sops/search/${content}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const documents: Array<SOP> = await res.json();
  return documents;
};

export async function deleteSop(
  sop_id: Number,
  directory_name: String,
): Promise<void> {
  const body = {
    sop_id,
    directory_name,
  };
  console.log(`Body: ${body}`);
  const res = await fetch(`${BASE_URL}/sops/`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
}