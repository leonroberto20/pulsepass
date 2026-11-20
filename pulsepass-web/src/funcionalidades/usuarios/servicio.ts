import { http } from '@/lib/http'
import type { RegisterUserRequest, UserResponse } from './tipos'
import { UserResponseSchema } from './esquemas'

export const usuariosServicio = {
  async registrar(datos: RegisterUserRequest): Promise<UserResponse> {
    return http.post<UserResponse>('/users', datos, {
      schema: UserResponseSchema,
    })
  },

  async obtenerPorUsername(username: string): Promise<UserResponse> {
    return http.get<UserResponse>(`/users/by-username?username=${encodeURIComponent(username)}`, {
      schema: UserResponseSchema,
    })
  },

  async obtenerPorEmail(email: string): Promise<UserResponse> {
    return http.get<UserResponse>(`/users/by-email?email=${encodeURIComponent(email)}`, {
      schema: UserResponseSchema,
    })
  },
}
