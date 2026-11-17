import type { ReactNode } from 'react'
import clsx from 'clsx'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type TipoAviso = 'exito' | 'error' | 'advertencia' | 'info'

const CONFIG_AVISO: Record<
  TipoAviso,
  { contenedor: string; icono: typeof Info; colorIcono: string }
> = {
  exito: {
    contenedor:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icono: CheckCircle2,
    colorIcono: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    contenedor:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    icono: AlertCircle,
    colorIcono: 'text-red-600 dark:text-red-400',
  },
  advertencia: {
    contenedor:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icono: AlertTriangle,
    colorIcono: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    contenedor:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    icono: Info,
    colorIcono: 'text-sky-600 dark:text-sky-400',
  },
}

export interface AvisoProps {
  tipo?: TipoAviso
  titulo?: string
  mensaje?: string
  children?: ReactNode
  onCerrar?: () => void
  className?: string
}

export function Aviso({
  tipo = 'info',
  titulo,
  mensaje,
  children,
  onCerrar,
  className,
}: AvisoProps) {
  const cfg = CONFIG_AVISO[tipo]
  const Icono = cfg.icono

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-xl border p-4 text-sm',
        cfg.contenedor,
        className,
      )}
    >
      <Icono className={clsx('h-5 w-5 shrink-0 mt-0.5', cfg.colorIcono)} aria-hidden="true" />
      <div className="flex-1">
        {titulo && <h4 className="font-semibold">{titulo}</h4>}
        {mensaje && <p className={titulo ? 'mt-1' : ''}>{mensaje}</p>}
        {children && <div className={titulo || mensaje ? 'mt-2' : ''}>{children}</div>}
      </div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          className="rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
