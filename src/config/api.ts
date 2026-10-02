/**
 * API configuration and helper utilities for client-server communication.
 * Reads VITE_API_URL from environment variables for production (e.g., Vercel -> Render).
 */

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();

// Normalize base URL by removing any trailing slashes
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Builds the full API URL for a given endpoint path.
 *
 * Examples:
 * - When VITE_API_URL is "https://backend.onrender.com" and path is "/api/health":
 *   Returns "https://backend.onrender.com/api/health"
 * - When VITE_API_URL is "https://backend.onrender.com/api" and path is "/api/health":
 *   Returns "https://backend.onrender.com/api/health"
 * - When VITE_API_URL is unset/empty (local development):
 *   Returns "/api/health" (utilizing Vite's dev proxy)
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  // Prevent duplicate /api/api if base URL already includes /api
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.substring(4)}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}
