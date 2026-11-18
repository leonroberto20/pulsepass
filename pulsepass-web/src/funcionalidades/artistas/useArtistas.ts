import { useQuery } from '@tanstack/react-query'
import { artistasServicio } from './servicio'

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: () => artistasServicio.listarActivos(),
  })
}

export function useArtista(id: number | string | undefined) {
  return useQuery({
    queryKey: ['artistas', 'detalle', id],
    queryFn: () => {
      if (!id) throw new Error('ID de artista no especificado')
      return artistasServicio.obtenerPorId(id)
    },
    enabled: Boolean(id),
  })
}
