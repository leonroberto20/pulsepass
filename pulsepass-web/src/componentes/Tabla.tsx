import type { ReactNode } from 'react'
import clsx from 'clsx'

export interface ColumnaTabla<T> {
  encabezado: string
  celda?: (fila: T) => ReactNode
  render?: (fila: T) => ReactNode
  clave?: string
  alineacion?: 'izquierda' | 'centro' | 'derecha'
}

export interface TablaProps<T> {
  columnas: ColumnaTabla<T>[]
  filas?: T[]
  datos?: T[]
  claveFila: (fila: T) => string | number
  mensajeVacio?: string
  className?: string
}

export function Tabla<T>({
  columnas,
  filas,
  datos,
  claveFila,
  mensajeVacio = 'No hay registros disponibles',
  className,
}: TablaProps<T>) {
  const lista = filas ?? datos ?? []

  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800', className)}>
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            {columnas.map((col, idx) => (
              <th
                key={col.clave || idx}
                scope="col"
                className={clsx(
                  'px-6 py-3.5',
                  col.alineacion === 'centro' && 'text-center',
                  col.alineacion === 'derecha' && 'text-right',
                )}
              >
                {col.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {lista.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length}
                className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            lista.map((fila) => (
              <tr
                key={claveFila(fila)}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                {columnas.map((col, idx) => {
                  const renderizador = col.celda || col.render
                  return (
                    <td
                      key={col.clave || idx}
                      className={clsx(
                        'px-6 py-4 whitespace-nowrap',
                        col.alineacion === 'centro' && 'text-center',
                        col.alineacion === 'derecha' && 'text-right',
                      )}
                    >
                      {renderizador ? renderizador(fila) : null}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
