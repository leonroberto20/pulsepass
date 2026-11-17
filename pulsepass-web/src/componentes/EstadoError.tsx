import { AlertCircle, RefreshCw } from 'lucide-react'
import { Boton } from './Boton'
import clsx from 'clsx'

export interface EstadoErrorProps {
  titulo?: string
  mensaje?: string
  onReintentar?: () => void
  className?: string
}

export function EstadoError({
  titulo = 'Ocurrió un error al cargar la información',
  mensaje = 'No pudimos conectar con el servidor o los datos no están disponibles temporalmente.',
  onReintentar,
  className,
}: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20',
        className,
      )}
    >
      <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-red-900 dark:text-red-300">
        {titulo}
      </h3>
      <p className="mt-1 max-w-md text-sm text-red-700 dark:text-red-400">
        {mensaje}
      </p>
      {onReintentar && (
        <div className="mt-4">
          <Boton
            variante="secundario"
            onClick={onReintentar}
            icono={<RefreshCw className="h-4 w-4" />}
          >
            Reintentar
          </Boton>
        </div>
      )}
    </div>
  )
}
