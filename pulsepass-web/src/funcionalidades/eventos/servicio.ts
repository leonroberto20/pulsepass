import { http } from '@/lib/http'
import type { CreateEventRequest, EventResponse, EventSummaryResponse } from './tipos'
import { EventResponseSchema, EventSummaryListResponseSchema } from './esquemas'

export const eventosServicio = {
  async listarPublicados(): Promise<EventSummaryResponse[]> {
    return http.get<EventSummaryResponse[]>('/events/published', {
      schema: EventSummaryListResponseSchema,
    })
  },

  async obtenerPorCodigo(eventCode: string): Promise<EventResponse> {
    return http.get<EventResponse>(`/events/${encodeURIComponent(eventCode)}`, {
      schema: EventResponseSchema,
    })
  },

  async listarPorArtista(stageName: string): Promise<EventSummaryResponse[]> {
    return http.get<EventSummaryResponse[]>(
      `/events/by-artist?stageName=${encodeURIComponent(stageName)}`,
      {
        schema: EventSummaryListResponseSchema,
      },
    )
  },

  async crear(datos: CreateEventRequest): Promise<EventResponse> {
    return http.post<EventResponse>('/events', datos, {
      schema: EventResponseSchema,
    })
  },

  async publicar(eventCode: string): Promise<EventResponse> {
    return http.patch<EventResponse>(`/events/${encodeURIComponent(eventCode)}/publish`, {}, {
      schema: EventResponseSchema,
    })
  },

  async agregarArtista(eventCode: string, artistId: number | string): Promise<EventResponse> {
    return http.post<EventResponse>(
      `/events/${encodeURIComponent(eventCode)}/artists/${encodeURIComponent(artistId)}`,
      {},
      {
        schema: EventResponseSchema,
      },
    )
  },
}
