import { z } from 'zod'
import { RolSchema, normalizarRol } from '@/lib/esquemasComunes'

export const LoginRequestSchema = z.object({
  identifier: z.string().min(1, 'El nombre de usuario o correo es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const AuthenticatedUserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).transform((roles) => {
    return roles
      .map(normalizarRol)
      .filter((r): r is z.infer<typeof RolSchema> => r !== null)
  }),
})

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string().default('Bearer'),
  expiresInSeconds: z.number().default(900),
  user: AuthenticatedUserResponseSchema.optional(),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type AuthenticatedUserResponse = z.infer<typeof AuthenticatedUserResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
