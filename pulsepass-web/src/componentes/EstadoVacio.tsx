import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import clsx from 'clsx'

export interface EstadoVacioProps {
  titulo?: string
  mensaje?: string
  icono?: ReactNode
  accion?: ReactNode
  className?: string
}

export function EstadoVacio({
  titulo = 'No hay datos para mostrar',
  mensaje = 'No se encontraron registros que coincidan con la búsqueda o la vista actual.',
  icono,
  accion,
  className,
}: EstadoVacioProps) {
  return (
    <div
      className={clsx(
        'flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800',
        className,
      )}
    >
      <div className="rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icono || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
        {titulo}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {mensaje}
      </p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
