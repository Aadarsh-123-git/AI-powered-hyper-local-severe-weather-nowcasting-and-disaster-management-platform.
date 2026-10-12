// Centralized API Client Service
const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || '');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  } | null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success && json.error) {
        throw new Error(json.error.message || 'API request failed');
      }
      return json.data as T;
    }
    return json as T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.warn(`[API Client] ${endpoint} request failed (${message}).`);
    throw err;
  }
}
