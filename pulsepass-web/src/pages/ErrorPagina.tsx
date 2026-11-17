import { useRouteError, isRouteErrorResponse, Link } from 'react-router'
import { AlertOctagon, Home, RefreshCw } from 'lucide-react'
import { Boton } from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function ErrorPagina() {
  const error = useRouteError()

  let titulo = 'Ocurrió un error inesperado'
  let mensaje = 'No pudimos procesar tu solicitud en este momento. Por favor, intenta nuevamente más tarde.'

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      titulo = 'Recurso no encontrado (404)'
      mensaje = 'El recurso o página solicitada no está disponible.'
    } else if (error.status === 403) {
      titulo = 'Acceso Denegado (403)'
      mensaje = 'No cuentas con los permisos necesarios para realizar esta acción.'
    } else {
      titulo = `Error ${error.status}: ${error.statusText || 'Error de ruta'}`
      mensaje = typeof error.data === 'string' ? error.data : mensaje
    }
  } else if (error instanceof Error) {
    mensaje = error.message
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <AlertOctagon className="h-12 w-12" />
      </div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {titulo}
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        {mensaje}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to={RUTAS.inicio}>
          <Boton variante="primario" icono={<Home className="h-4 w-4" />}>
            Volver al Inicio
          </Boton>
        </Link>
        <button type="button" onClick={() => window.location.reload()}>
          <Boton variante="secundario" icono={<RefreshCw className="h-4 w-4" />}>
            Recargar Página
          </Boton>
        </button>
      </div>
    </div>
  )
}
