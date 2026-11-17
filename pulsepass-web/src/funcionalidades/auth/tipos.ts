import type { AuthenticatedUserResponse, LoginRequest, AuthResponse } from './esquemas'
import type { Rol } from '@/lib/esquemasComunes'

export type { AuthenticatedUserResponse, LoginRequest, AuthResponse, Rol }

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo' }
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: AuthenticatedUserResponse
    }

export interface AuthContextType {
  sesion: Sesion
  iniciarSesion: (credenciales: LoginRequest) => Promise<void>
  cerrarSesion: (motivo?: string) => void
  tieneRol: (...roles: Rol[]) => boolean
}
