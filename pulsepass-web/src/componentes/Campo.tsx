import { forwardRef, useId, type ComponentProps } from 'react'
import clsx from 'clsx'

export interface CampoProps extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { etiqueta, error, ayuda, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const ayudaId = `${inputId}-ayuda`

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {etiqueta}
        {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>

      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={clsx(error && errorId, ayuda && ayudaId) || undefined}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
          'bg-white text-slate-900 placeholder:text-slate-400',
          'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          'focus-visible:outline-2 focus-visible:outline-offset-1',
          error
            ? 'border-red-500 focus-visible:outline-red-500 dark:border-red-500'
            : 'border-slate-300 focus-visible:outline-marca-600 dark:border-slate-700',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:disabled:bg-slate-800',
          className,
        )}
        {...props}
      />

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
