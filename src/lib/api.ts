import { ApiError } from './query-client'
import { config } from './config'
import { getAccessToken } from './auth-token'

const BASE_URL = config.apiUrl

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ApiError(response.status, message)
  }

  // Return null for 204 No Content
  if (response.status === 204) return null as T

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestInit, 'method'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: Omit<RequestInit, 'method'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
