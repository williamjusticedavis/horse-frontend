import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { ApiError } from '../lib/query-client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(body: unknown, status = 200): Response {
  if (status === 204) {
    return new Response(null, { status: 204 })
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('api', () => {
  let fetchMock: ReturnType<typeof mock>

  beforeEach(async () => {
    // Reset the in-memory access token between tests
    const { setAccessToken } = await import('../lib/auth-token')
    setAccessToken(null)

    fetchMock = mock(() => Promise.resolve(makeResponse({ ok: true })))
    globalThis.fetch = fetchMock as unknown as typeof fetch
  })

  test('GET sends the right method and URL', async () => {
    const { api } = await import('../lib/api')
    await api.get('/test')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/test')
    expect(options.method).toBe('GET')
  })

  test('POST serialises the body as JSON', async () => {
    const { api } = await import('../lib/api')
    await api.post('/test', { name: 'spirit' })
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ name: 'spirit' }))
  })

  test('PATCH sends the right method', async () => {
    const { api } = await import('../lib/api')
    await api.patch('/test', { age: 5 })
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('PATCH')
  })

  test('DELETE sends the right method', async () => {
    const { api } = await import('../lib/api')
    await api.delete('/test')
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('DELETE')
  })

  test('injects Authorization header when a token is set', async () => {
    const { setAccessToken } = await import('../lib/auth-token')
    const { api } = await import('../lib/api')
    setAccessToken('my-test-token')
    await api.get('/test')
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer my-test-token'
    )
  })

  test('does NOT inject Authorization header when no token', async () => {
    const { api } = await import('../lib/api')
    await api.get('/test')
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  test('throws ApiError on non-2xx response', async () => {
    fetchMock = mock(() => Promise.resolve(makeResponse({ error: 'Not found' }, 404)))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { api } = await import('../lib/api')

    let caught: unknown
    try {
      await api.get('/test')
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as ApiError).status).toBe(404)
  })

  test('ApiError carries the right status code', async () => {
    fetchMock = mock(() => Promise.resolve(makeResponse({ error: 'Unauthorised' }, 401)))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { api } = await import('../lib/api')

    let caught: unknown
    try {
      await api.get('/test')
    } catch (e) {
      caught = e
    }
    expect((caught as ApiError).status).toBe(401)
  })

  test('returns null for 204 No Content', async () => {
    fetchMock = mock(() => Promise.resolve(makeResponse(null, 204)))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { api } = await import('../lib/api')
    const result = await api.delete('/test')
    expect(result).toBeNull()
  })

  test('returns parsed JSON body on success', async () => {
    fetchMock = mock(() => Promise.resolve(makeResponse({ horses: [] })))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { api } = await import('../lib/api')
    const result = await api.get<{ horses: unknown[] }>('/test')
    expect(result).toEqual({ horses: [] })
  })
})
