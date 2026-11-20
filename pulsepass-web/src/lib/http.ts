import { z } from 'zod'
import { ErrorResponseSchema } from './esquemasComunes'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Token en memoria y sincronizado en sessionStorage (PRD §12.2)
const STORAGE_KEY_TOKEN = 'pulsepass_token'
let tokenMemoria: string | null = null

export function obtenerToken(): string | null {
  if (tokenMemoria) return tokenMemoria
  try {
    const almacenado = sessionStorage.getItem(STORAGE_KEY_TOKEN)
    tokenMemoria = almacenado
    return almacenado
  } catch {
    return null
  }
}

export function guardarToken(token: string | null): void {
  tokenMemoria = token
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, token)
    } else {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN)
    }
  } catch {
    // Si el entorno restringe storage (ej. iframes de prueba), se mantiene en memoria
  }
}

// Suscriptores al evento 401 para cerrar sesión automáticamente
type Callback401 = () => void
const suscriptores401: Set<Callback401> = new Set()

export function suscribir401(callback: Callback401): () => void {
  suscriptores401.add(callback)
  return () => {
    suscriptores401.delete(callback)
  }
}

function notificar401() {
  suscriptores401.forEach((cb) => {
    try {
      cb()
    } catch (e) {
      console.error('Error en suscriptor 401:', e)
    }
  })
}

export interface OpcionesPeticion extends RequestInit {
  schema?: z.ZodTypeAny
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { schema, headers, ...resto } = opciones
  const url = ruta.startsWith('http') ? ruta : `${BASE_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`

  const cabeceras: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  }

  const token = obtenerToken()
  if (token && !cabeceras['Authorization']) {
    cabeceras['Authorization'] = `Bearer ${token}`
  }

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      ...resto,
      headers: cabeceras,
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor.')
  }

  if (respuesta.status === 401) {
    notificar401()
  }

  if (!respuesta.ok) {
    let mensaje = respuesta.statusText || 'Error en la petición'
    let detalles: Record<string, string> = {}

    try {
      const cuerpoError = await respuesta.json()
      const validacionError = ErrorResponseSchema.safeParse(cuerpoError)
      if (validacionError.success) {
        mensaje = validacionError.data.message || mensaje
        detalles = validacionError.data.details || {}
      } else if (typeof cuerpoError.message === 'string') {
        mensaje = cuerpoError.message
      }
    } catch {
      // Si la respuesta no es JSON, se conserva el mensaje genérico
    }

    throw new ApiError(respuesta.status, mensaje, detalles)
  }

  if (respuesta.status === 204) {
    return undefined as unknown as T
  }

  const datos = await respuesta.json()

  if (schema) {
    return schema.parse(datos) as T
  }

  return datos as T
}

export const http = {
  get: <T>(url: string, opciones?: OpcionesPeticion) =>
    peticion<T>(url, { ...opciones, method: 'GET' }),

  post: <T>(url: string, cuerpo?: unknown, opciones?: OpcionesPeticion) =>
    peticion<T>(url, {
      ...opciones,
      method: 'POST',
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    }),

  patch: <T>(url: string, cuerpo?: unknown, opciones?: OpcionesPeticion) =>
    peticion<T>(url, {
      ...opciones,
      method: 'PATCH',
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    }),

  delete: <T>(url: string, opciones?: OpcionesPeticion) =>
    peticion<T>(url, { ...opciones, method: 'DELETE' }),
}
