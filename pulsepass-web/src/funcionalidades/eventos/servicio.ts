import { http } from '@/lib/http'
import type { EventResponse, EventSummaryResponse } from './tipos'
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
}
