import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthContextType, Sesion, Rol, LoginRequest, AuthResponse, AuthenticatedUserResponse } from './tipos'
import { guardarToken, obtenerToken, suscribir401, http } from '@/lib/http'
import { limpiarCache } from '@/lib/queryClient'
import { AuthResponseSchema, AuthenticatedUserResponseSchema } from './esquemas'

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY_USER = 'pulsepass_user'
const STORAGE_KEY_EXPIRES = 'pulsepass_expires'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(() => {
    const token = obtenerToken()
    const expiraEnStr = sessionStorage.getItem(STORAGE_KEY_EXPIRES)
    const userStr = sessionStorage.getItem(STORAGE_KEY_USER)

    if (token && expiraEnStr && userStr) {
      try {
        const expiraEn = parseInt(expiraEnStr, 10)
        if (Date.now() < expiraEn) {
          const rawUser = JSON.parse(userStr)
          const usuario = AuthenticatedUserResponseSchema.parse(rawUser)
          return {
            estado: 'autenticado',
            token,
            expiraEn,
            usuario,
          }
        }
      } catch {
        // En caso de error de parseo o token vencido, se descarta
      }
    }
    return { estado: 'anonimo' }
  })

  const cerrarSesion = useCallback((_motivo?: string) => {
    guardarToken(null)
    sessionStorage.removeItem(STORAGE_KEY_USER)
    sessionStorage.removeItem(STORAGE_KEY_EXPIRES)
    limpiarCache()
    setSesion({ estado: 'anonimo' })
  }, [])

  // Suscribirse a eventos 401 globales lanzados por lib/http.ts (PRD §12.2)
  useEffect(() => {
    const desuscribir = suscribir401(() => {
      cerrarSesion('expirada')
    })
    return desuscribir
  }, [cerrarSesion])

  // Temporizador para cerrar sesión automáticamente al expirar expiraEn
  useEffect(() => {
    if (sesion.estado === 'autenticado') {
      const tiempoRestante = sesion.expiraEn - Date.now()
      if (tiempoRestante <= 0) {
        cerrarSesion('expirada')
        return
      }
      const timeout = setTimeout(() => {
        cerrarSesion('expirada')
      }, tiempoRestante)
      return () => clearTimeout(timeout)
    }
  }, [sesion, cerrarSesion])

  const iniciarSesion = useCallback(
    async (credenciales: LoginRequest) => {
      setSesion({ estado: 'cargando' })
      try {
        const respuesta = await http.post<AuthResponse>(
          '/auth/login',
          credenciales,
          { schema: AuthResponseSchema },
        )

        const token = respuesta.accessToken
        guardarToken(token)

        // Consultar /auth/me para obtener datos del usuario y sus roles oficiales
        const usuario = await http.get<AuthenticatedUserResponse>('/auth/me', {
          schema: AuthenticatedUserResponseSchema,
        })

        const expiraEn = Date.now() + (respuesta.expiresInSeconds || 900) * 1000

        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario))
        sessionStorage.setItem(STORAGE_KEY_EXPIRES, expiraEn.toString())

        setSesion({
          estado: 'autenticado',
          token,
          expiraEn,
          usuario,
        })
      } catch (error) {
        guardarToken(null)
        setSesion({ estado: 'anonimo' })
        throw error
      }
    },
    [],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]) => {
      if (sesion.estado !== 'autenticado') return false
      return roles.some((r) => sesion.usuario.roles.includes(r))
    },
    [sesion],
  )

  return (
    <AuthContext.Provider
      value={{
        sesion,
        iniciarSesion,
        cerrarSesion,
        tieneRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return contexto
}
