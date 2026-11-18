import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsServicio } from './servicio'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import type { PurchaseTicketRequest } from './tipos'

export function useMisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''

  return useQuery({
    queryKey: ['tickets', 'misTickets', email],
    queryFn: () => ticketsServicio.listarPorUsuario(email),
    enabled: Boolean(email),
  })
}

export function useTicket(ticketCode: string | undefined) {
  return useQuery({
    queryKey: ['tickets', 'detalle', ticketCode],
    queryFn: () => {
      if (!ticketCode) throw new Error('Código de ticket no especificado')
      return ticketsServicio.obtenerPorCodigo(ticketCode)
    },
    enabled: Boolean(ticketCode),
  })
}

export function useComprarTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: PurchaseTicketRequest) => ticketsServicio.comprar(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useCancelarTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketCode: string) => ticketsServicio.cancelar(ticketCode),
    onSuccess: (_data, ticketCode) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'detalle', ticketCode] })
      queryClient.invalidateQueries({ queryKey: ['tickets', 'misTickets'] })
    },
  })
}
