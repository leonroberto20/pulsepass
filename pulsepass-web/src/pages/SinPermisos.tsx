import { Link } from 'react-router'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'
import { Boton } from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function SinPermisos() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <span className="mt-4 text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
        Error 403
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Acceso no autorizado
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        Tu rol actual no tiene los privilegios necesarios para acceder a esta página o recurso.
        Si consideras que es un error, por favor comunícate con el administrador.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to={RUTAS.inicio}>
          <Boton variante="primario" icono={<Home className="h-4 w-4" />}>
            Ir al Inicio
          </Boton>
        </Link>
        <button type="button" onClick={() => window.history.back()}>
          <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
            Regresar
          </Boton>
        </button>
      </div>
    </div>
  )
}
