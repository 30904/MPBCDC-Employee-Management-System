import { API_BASE_PATH } from '../api/config.js';

/**
 * Resolves a stored upload path (/uploads/...) to a browser-accessible URL.
 * Uploads are served from the API host root, not under /api.
 */
export function resolveUploadUrl(url) {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (/^https?:\/\//i.test(API_BASE_PATH)) {
    const origin = API_BASE_PATH.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }

  return path;
}
