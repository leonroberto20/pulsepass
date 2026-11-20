import { http } from '@/lib/http'
import type { VenueResponse } from './tipos'
import { VenueResponseSchema, VenueListResponseSchema } from './esquemas'

export const sedesServicio = {
  async listarActivas(): Promise<VenueResponse[]> {
    return http.get<VenueResponse[]>('/venues/active', {
      schema: VenueListResponseSchema,
    })
  },

  async obtenerPorCodigo(code: string): Promise<VenueResponse> {
    return http.get<VenueResponse>(`/venues/${encodeURIComponent(code)}`, {
      schema: VenueResponseSchema,
    })
  },
}
