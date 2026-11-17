import { useQuery } from '@tanstack/react-query'
import { eventosServicio } from './servicio'

export function useEventosPublicados() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: () => eventosServicio.listarPublicados(),
  })
}

export function useEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: ['eventos', 'detalle', eventCode],
    queryFn: () => {
      if (!eventCode) throw new Error('Código de evento no especificado')
      return eventosServicio.obtenerPorCodigo(eventCode)
    },
    enabled: Boolean(eventCode),
  })
}

export function useEventosPorArtista(stageName: string | undefined) {
  return useQuery({
    queryKey: ['eventos', 'porArtista', stageName],
    queryFn: () => {
      if (!stageName) return []
      return eventosServicio.listarPorArtista(stageName)
    },
    enabled: Boolean(stageName),
  })
}
