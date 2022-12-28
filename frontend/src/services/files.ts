const BASE_URL = process.env.NUXT_ENV_API_URL;

export async function getFile(location) {
  let res = await fetch(`${BASE_URL}/files/${location}`);
  const locationHtml = location.split('.')[0] + '.html';
  res = await fetch(`${BASE_URL}/files/${locationHtml}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const file = await res;
  return file.text();
}
