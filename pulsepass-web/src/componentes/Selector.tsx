import { forwardRef, useId, type ComponentProps } from 'react'
import clsx from 'clsx'

export interface OpcionSelector {
  valor: string
  etiqueta: string
  deshabilitada?: boolean
}

export interface SelectorProps extends ComponentProps<'select'> {
  etiqueta: string
  error?: string
  ayuda?: string
  opciones?: OpcionSelector[]
}

export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(function Selector(
  { etiqueta, error, ayuda, opciones, children, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`
  const ayudaId = `${selectId}-ayuda`

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {etiqueta}
        {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>

      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={clsx(error && errorId, ayuda && ayudaId) || undefined}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
          'bg-white text-slate-900',
          'dark:bg-slate-900 dark:text-slate-100',
          'focus-visible:outline-2 focus-visible:outline-offset-1',
          error
            ? 'border-red-500 focus-visible:outline-red-500 dark:border-red-500'
            : 'border-slate-300 focus-visible:outline-marca-600 dark:border-slate-700',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:disabled:bg-slate-800',
          className,
        )}
        {...props}
      >
        {opciones
          ? opciones.map((opc) => (
              <option key={opc.valor} value={opc.valor} disabled={opc.deshabilitada}>
                {opc.etiqueta}
              </option>
            ))
          : children}
      </select>

      {ayuda && !error && (
        <p id={ayudaId} className="text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})
