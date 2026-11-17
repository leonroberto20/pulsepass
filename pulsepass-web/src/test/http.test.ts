import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, ApiError, guardarToken, obtenerToken, suscribir401 } from '@/lib/http'
import { z } from 'zod'

describe('Cliente HTTP nativo y ApiError (Etapa 4)', () => {
  const fetchOriginal = globalThis.fetch

  beforeEach(() => {
    guardarToken(null)
    sessionStorage.clear()
  })

  afterEach(() => {
    globalThis.fetch = fetchOriginal
    vi.restoreAllMocks()
  })

  it('TEST-FE-LIB-001: realiza GET y valida con schema Zod', async () => {
    const mockData = { id: 1, name: 'Sede Principal' }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const schema = z.object({ id: z.number(), name: z.string() })
    const res = await http.get('/sedes/1', { schema })

    expect(res).toEqual(mockData)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/sedes/1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it('TEST-FE-LIB-002: inyecta Authorization Bearer si hay token almacenado', async () => {
    guardarToken('jwt-token-seguro-123')
    expect(obtenerToken()).toBe('jwt-token-seguro-123')

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })

    await http.get('/eventos')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/eventos',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-seguro-123',
        }),
      }),
    )
  })

  it('TEST-FE-LIB-003: mapea ErrorResponse del backend a ApiError con status y details', async () => {
    const backendError = {
      timestamp: '2026-11-17T20:00:00Z',
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: {
        eventCode: 'Event code is required',
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => backendError,
    })

    await expect(http.post('/eventos', {})).rejects.toThrow(ApiError)

    try {
      await http.post('/eventos', {})
    } catch (err) {
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(400)
      expect(apiErr.message).toBe('Validation failed')
      expect(apiErr.details['eventCode']).toBe('Event code is required')
    }
  })

  it('TEST-FE-LIB-004: notifica a suscriptores 401 para cierre de sesión', async () => {
    const handler401 = vi.fn()
    const desuscribir = suscribir401(handler401)

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expirado' }),
    })

    await expect(http.get('/cuenta')).rejects.toThrow(ApiError)
    expect(handler401).toHaveBeenCalledTimes(1)

    desuscribir()
  })

  it('TEST-FE-LIB-005: captura fallos de red y lanza ApiError(0)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    try {
      await http.get('/eventos')
      expect.fail('Debería haber lanzado ApiError')
    } catch (err) {
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(0)
      expect(apiErr.message).toContain('No pudimos conectar con el servidor')
    }
  })
})
