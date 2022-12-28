import { Document } from '../types/index';

const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function getDocuments(): Promise<Array<Document>> {
  const res = await fetch(`${BASE_URL}/documents/`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const documents: Array<Document> = await res.json();
  return documents;
}

export async function getDocumentsWithSopId(sop_id): Promise<Array<Document>> {
  const documents = await getDocuments();
  console.log(documents.filter((document) => document.sop_id === sop_id));
  return documents.filter((document) => document.sop_id === sop_id);
}

export async function getDocument(id): Promise<Document> {
  const res = await fetch(`${BASE_URL}/documents/${id}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const document: Document = await res.json();
  return document;
}

export async function uploadNew(data: any): Promise<Document> {
  const res = await fetch(`${BASE_URL}/documents/uploadNew`, {
    method: 'POST',
    body: data,
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const document: Document = await res.json();
  return document;
}

export async function updateExisting(data: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/documents/updateExisting`, {
    method: 'POST',
    body: data,
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const newDocumentId = await res.json();
  return newDocumentId;
}

export async function save(data: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/documents/save`, {
    method: 'POST',
    body: data,
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const newDocumentId = await res.json();
  return newDocumentId;
}

export async function markDeleteDocument(id): Promise<void> {
  const res = await fetch(`${BASE_URL}/documents/mark-delete/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${encodeURIComponent(
        window.localStorage.getItem('accessToken')
      )}`,
    },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

export async function deleteDocument(id): Promise<Document> {
  const res = await fetch(`${BASE_URL}/documents/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${encodeURIComponent(
        window.localStorage.getItem('accessToken')
      )}`,
    },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const document: Document = await res.json();
  return document;
}

export async function downloadDocument(document: Document): Promise<string> {
  const res = await fetch(`${BASE_URL}/documents/download/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json', 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${encodeURIComponent(
        window.localStorage.getItem('accessToken')
      )}`,
    },
    body: JSON.stringify(document)
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const extension = await res.text()
  const downloadUrl = `${BASE_URL}/files/${extension}`;
  return downloadUrl;

}