import { http } from '@/lib/http'
import type { PurchaseTicketRequest, TicketResponse } from './tipos'
import { TicketResponseSchema, TicketListResponseSchema } from './esquemas'

export const ticketsServicio = {
  async comprar(datos: PurchaseTicketRequest): Promise<TicketResponse> {
    return http.post<TicketResponse>('/tickets', datos, {
      schema: TicketResponseSchema,
    })
  },

  async obtenerPorCodigo(ticketCode: string): Promise<TicketResponse> {
    return http.get<TicketResponse>(`/tickets/${encodeURIComponent(ticketCode)}`, {
      schema: TicketResponseSchema,
    })
  },

  async listarPorUsuario(email: string): Promise<TicketResponse[]> {
    return http.get<TicketResponse[]>(`/tickets/by-user?email=${encodeURIComponent(email)}`, {
      schema: TicketListResponseSchema,
    })
  },

  async cancelar(ticketCode: string): Promise<TicketResponse> {
    return http.patch<TicketResponse>(`/tickets/${encodeURIComponent(ticketCode)}/cancel`, {}, {
      schema: TicketResponseSchema,
    })
  },

  async marcarUsado(ticketCode: string): Promise<TicketResponse> {
    return http.patch<TicketResponse>(`/tickets/${encodeURIComponent(ticketCode)}/use`, {}, {
      schema: TicketResponseSchema,
    })
  },

  async listarPagadosPorEvento(eventCode: string): Promise<TicketResponse[]> {
    return http.get<TicketResponse[]>(
      `/events/${encodeURIComponent(eventCode)}/tickets/paid`,
      {
        schema: TicketListResponseSchema,
      },
    )
  },
}
