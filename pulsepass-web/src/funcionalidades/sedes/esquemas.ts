import { z } from 'zod'

export const VenueResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullable().optional(),
  capacity: z.number(),
  active: z.boolean(),
})

export const VenueListResponseSchema = z.array(VenueResponseSchema)

export type VenueResponse = z.infer<typeof VenueResponseSchema>
export type VenueListResponse = z.infer<typeof VenueListResponseSchema>
