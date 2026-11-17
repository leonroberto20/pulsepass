import { z } from 'zod'
import { ArtistResponseSchema } from '@/funcionalidades/artistas/esquemas'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

export const EventStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])

export const EventResponseSchema = z.object({
  id: z.number(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  minimumAge: z.number(),
  streamingUrl: z.string().nullable().optional(),
  venueCode: z.string(),
  venueName: z.string(),
  artists: z.array(ArtistResponseSchema).default([]),
})

export const EventSummaryResponseSchema = z.object({
  id: z.number(),
  eventCode: z.string(),
  name: z.string(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  venueName: z.string(),
})

export const EventSummaryListResponseSchema = z.array(EventSummaryResponseSchema)

export const CreateEventRequestSchema = z.object({
  eventCode: z
    .string()
    .min(3, 'El código del evento debe tener al menos 3 caracteres')
    .max(50, 'El código del evento no puede superar 50 caracteres'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede superar 255 caracteres'),
  description: z.string().max(1000, 'La descripción no puede superar 1000 caracteres').optional(),
  category: EventCategorySchema,
  eventDate: z.string().min(1, 'La fecha del evento es obligatoria'),
  minimumAge: z.coerce
    .number()
    .int('La edad mínima debe ser un número entero')
    .min(0, 'La edad mínima no puede ser menor a 0'),
  venueCode: z.string().min(1, 'La sede es obligatoria'),
})

export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventStatus = z.infer<typeof EventStatusSchema>
export type EventResponse = z.infer<typeof EventResponseSchema>
export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>
export type EventSummaryListResponse = z.infer<typeof EventSummaryListResponseSchema>
export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>
