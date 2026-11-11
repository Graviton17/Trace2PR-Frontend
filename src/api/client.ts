import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

function usesNgrokBrowserWarning(apiBase: string): boolean {
  try {
    const hostname = new URL(apiBase).hostname;
    return hostname === 'ngrok-free.dev' || hostname.endsWith('.ngrok-free.dev');
  } catch {
    return false;
  }
}

/** Thrown for any non-2xx response. Carries the parsed error body (if any)
 * so callers can show a real message instead of a generic one. */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    // FastAPI's default HTTPException shape
    if (typeof b.detail === 'string') return b.detail;
    // The backend's RFC-7807-style handler (see api/middleware/errors.py)
    if (typeof b.detail === 'string' && typeof b.title === 'string') return b.detail;
    if (typeof b.title === 'string') return b.title;
  }
  return fallback;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function buildHeaders(extra?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extra);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // ngrok's free-tier browser warning is served by the tunnel before the API.
  // Skipping it lets the request reach FastAPI, which then supplies CORS headers.
  if (usesNgrokBrowserWarning(API_BASE)) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return headers;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await buildHeaders(init.headers);
  let response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (response.status === 401) {
    // Access token likely expired — refresh once and retry the request.
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session?.access_token) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${data.session.access_token}`);
      response = await fetch(`${API_BASE}${path}`, { ...init, headers: retryHeaders });
    }
  }

  if (!response.ok) {
    const body = await parseBody(response);
    throw new ApiError(response.status, extractErrorMessage(body, response.statusText), body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseBody(response)) as T;
}

/** Builds a `?a=1&b=2` query string, dropping undefined/null/empty values. */
export function toQueryString(params?: object): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
