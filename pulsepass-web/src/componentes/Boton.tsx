import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const VARIANTES: Record<VarianteBoton, string> = {
  primario:
    'bg-marca-600 text-white hover:bg-marca-700 active:bg-marca-800 focus-visible:outline-marca-600 dark:bg-marca-600 dark:hover:bg-marca-700',
  secundario:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:outline-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  peligro:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600',
  fantasma:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:bg-slate-800',
}

export interface BotonProps extends ComponentProps<'button'> {
  variante?: VarianteBoton
  cargando?: boolean
  icono?: ReactNode
}

export function Boton({
  variante = 'primario',
  cargando = false,
  icono,
  children,
  className,
  disabled,
  ...props
}: BotonProps) {
  const estaDeshabilitado = disabled || cargando

  return (
    <button
      {...props}
      disabled={estaDeshabilitado}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        className,
      )}
    >
      {cargando ? (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icono
      )}
      <span>{children}</span>
    </button>
  )
}
