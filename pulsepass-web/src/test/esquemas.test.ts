import { describe, it, expect } from 'vitest'
import { EventResponseSchema } from '@/funcionalidades/eventos/esquemas'
import { TicketResponseSchema } from '@/funcionalidades/tickets/esquemas'
import { VenueResponseSchema } from '@/funcionalidades/sedes/esquemas'
import { ArtistResponseSchema } from '@/funcionalidades/artistas/esquemas'
import { AuthenticatedUserResponseSchema } from '@/funcionalidades/auth/esquemas'
import { ErrorResponseSchema, normalizarRol } from '@/lib/esquemasComunes'

describe('Contratos y Esquemas Zod (Etapa 1)', () => {
  it('normaliza roles con prefijo ROLE_ o sin prefijo', () => {
    expect(normalizarRol('ROLE_USER')).toBe('USER')
    expect(normalizarRol('ROLE_STAFF')).toBe('STAFF')
    expect(normalizarRol('ROLE_ADMIN')).toBe('ADMIN')
    expect(normalizarRol('USER')).toBe('USER')
    expect(normalizarRol('INVALIDO')).toBeNull()
  })

  it('valida AuthenticatedUserResponse con mapeo de roles', () => {
    const rawData = {
      id: 1,
      username: 'andrea',
      email: 'andrea@example.com',
      roles: ['ROLE_USER'],
    }
    const parsed = AuthenticatedUserResponseSchema.parse(rawData)
    expect(parsed.roles).toEqual(['USER'])
  })

  it('valida EventResponse con artistas anidados', () => {
    const rawData = {
      id: 10,
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      description: 'Festival de música caribeña',
      category: 'MUSIC',
      status: 'PUBLISHED',
      eventDate: '2026-11-20T20:00:00Z',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: [
        { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electronic', active: true },
      ],
    }
    const parsed = EventResponseSchema.parse(rawData)
    expect(parsed.eventCode).toBe('CMF-2026')
    expect(parsed.artists).toHaveLength(1)
  })

  it('valida VenueResponse y ArtistResponse', () => {
    const venue = VenueResponseSchema.parse({
      id: 1,
      code: 'VEN-SMR-01',
      name: 'Marina Convention Center',
      city: 'Santa Marta',
      capacity: 3000,
      active: true,
    })
    expect(venue.code).toBe('VEN-SMR-01')

    const artist = ArtistResponseSchema.parse({
      id: 1,
      stageName: 'Neon Waves',
      active: true,
    })
    expect(artist.stageName).toBe('Neon Waves')
  })

  it('valida TicketResponse', () => {
    const ticket = TicketResponseSchema.parse({
      id: 50,
      ticketCode: 'TKT-CMF-001',
      type: 'GENERAL',
      price: 250000,
      status: 'PAID',
      purchaseDate: '2026-11-10T14:30:00Z',
      userEmail: 'andrea@example.com',
      eventCode: 'CMF-2026',
      eventName: 'Caribbean Music Fest 2026',
    })
    expect(ticket.ticketCode).toBe('TKT-CMF-001')
    expect(ticket.status).toBe('PAID')
  })

  it('valida ErrorResponse con detalles de validación', () => {
    const error = ErrorResponseSchema.parse({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: {
        eventCode: 'Event code is required',
      },
    })
    expect(error.status).toBe(400)
    expect(error.details?.['eventCode']).toBe('Event code is required')
  })
})
