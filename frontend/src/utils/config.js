const API_ORIGIN = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

/** Resolve upload/asset paths returned by the API (e.g. /uploads/photo.jpg) */
export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}
