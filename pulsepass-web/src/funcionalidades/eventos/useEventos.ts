import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventosServicio } from './servicio'
import type { CreateEventRequest } from './tipos'

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

export function useCrearEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CreateEventRequest) => eventosServicio.crear(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventCode: string) => eventosServicio.publicar(eventCode),
    onSuccess: (_data, eventCode) => {
      queryClient.invalidateQueries({ queryKey: ['eventos', 'detalle', eventCode] })
      queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] })
    },
  })
}

export function useAgregarArtistaAEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventCode, artistId }: { eventCode: string; artistId: number | string }) =>
      eventosServicio.agregarArtista(eventCode, artistId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['eventos', 'detalle', vars.eventCode] })
    },
  })
}
