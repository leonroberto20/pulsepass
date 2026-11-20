import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()).optional().default({}),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * Normaliza roles provenientes del backend (ej. "ROLE_USER" -> "USER")
 */
export function normalizarRol(rawRole: string): Rol | null {
  const limpio = rawRole.replace(/^ROLE_/, '')
  const resultado = RolSchema.safeParse(limpio)
  return resultado.success ? resultado.data : null
}
