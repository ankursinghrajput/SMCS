// Central API utility — prepends VITE_API_URL so fetch calls work in
// both local dev (where Vite's proxy rewrites /api/*) and in production
// on Vercel (where we must hit the Render backend directly).
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Drop-in replacement for fetch() that:
 *  - Prepends the backend base URL
 *  - Always sends cookies (credentials: 'include')
 *  - Accepts any standard RequestInit options to override defaults
 */
export const apiFetch = (path, options = {}) => {
  return fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
};
