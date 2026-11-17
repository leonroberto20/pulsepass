import { z } from 'zod'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])

export const PurchaseTicketRequestSchema = z.object({
  userEmail: z.string().email('El correo del comprador es inválido'),
  eventCode: z.string().min(1, 'El código del evento es obligatorio'),
  type: TicketTypeSchema,
})

export const TicketResponseSchema = z.object({
  id: z.number(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.number(),
  status: TicketStatusSchema,
  purchaseDate: z.string(),
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
})

export const TicketListResponseSchema = z.array(TicketResponseSchema)

export type TicketType = z.infer<typeof TicketTypeSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>
export type TicketResponse = z.infer<typeof TicketResponseSchema>
export type TicketListResponse = z.infer<typeof TicketListResponseSchema>
