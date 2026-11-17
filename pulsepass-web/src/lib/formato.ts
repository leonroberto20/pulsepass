/**
 * Utilidades de formateo para Colombia (es-CO)
 */

export function formatearMonedaCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatearFecha(fecha: string | Date): string {
  try {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
    }).format(f)
  } catch {
    return String(fecha)
  }
}

export function formatearFechaHora(fecha: string | Date): string {
  try {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(f)
  } catch {
    return String(fecha)
  }
}

export function formatearFechaCorta(fecha: string | Date): string {
  try {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(f)
  } catch {
    return String(fecha)
  }
}
