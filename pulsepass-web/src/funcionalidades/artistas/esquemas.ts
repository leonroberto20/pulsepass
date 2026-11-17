import { z } from 'zod'

export const ArtistResponseSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  country: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  active: z.boolean(),
})

export const ArtistListResponseSchema = z.array(ArtistResponseSchema)

export type ArtistResponse = z.infer<typeof ArtistResponseSchema>
export type ArtistListResponse = z.infer<typeof ArtistListResponseSchema>
