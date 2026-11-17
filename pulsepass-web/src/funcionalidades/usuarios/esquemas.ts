import { z } from 'zod'

export const RegisterUserRequestSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
})

export const UserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  active: z.boolean(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
})

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
