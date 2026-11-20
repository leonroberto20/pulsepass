import { http } from '@/lib/http'
import type { ArtistResponse } from './tipos'
import { ArtistResponseSchema, ArtistListResponseSchema } from './esquemas'

export const artistasServicio = {
  async listarActivos(): Promise<ArtistResponse[]> {
    return http.get<ArtistResponse[]>('/artists/active', {
      schema: ArtistListResponseSchema,
    })
  },

  async obtenerPorId(id: number | string): Promise<ArtistResponse> {
    return http.get<ArtistResponse>(`/artists/${encodeURIComponent(id)}`, {
      schema: ArtistResponseSchema,
    })
  },

  async obtenerPorNombreArtistico(stageName: string): Promise<ArtistResponse> {
    return http.get<ArtistResponse>(
      `/artists/by-stage-name?stageName=${encodeURIComponent(stageName)}`,
      {
        schema: ArtistResponseSchema,
      },
    )
  },
}
