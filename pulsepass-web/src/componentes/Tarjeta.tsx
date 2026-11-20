import type { ComponentProps } from 'react'
import clsx from 'clsx'

export interface TarjetaProps extends ComponentProps<'div'> {
  destacada?: boolean
  interactiva?: boolean
}

export function Tarjeta({
  destacada = false,
  interactiva = false,
  children,
  className,
  ...props
}: TarjetaProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white p-6 shadow-sm transition-all',
        'border border-slate-200 dark:border-slate-800 dark:bg-slate-900',
        destacada && 'ring-2 ring-marca-500 shadow-md',
        interactiva &&
          'hover:border-marca-500 hover:shadow-md cursor-pointer dark:hover:border-marca-500',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
