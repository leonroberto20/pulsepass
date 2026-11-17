import { Link } from 'react-router'
import { FileQuestion, Home, Search } from 'lucide-react'
import { Boton } from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function NoEncontrada() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <FileQuestion className="h-12 w-12 text-marca-600 dark:text-marca-400" />
      </div>
      <span className="mt-4 text-sm font-bold uppercase tracking-wider text-marca-600 dark:text-marca-400">
        Error 404
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        Lo sentimos, la dirección que buscas no existe o ha sido trasladada a otro evento o sección.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to={RUTAS.inicio}>
          <Boton variante="primario" icono={<Home className="h-4 w-4" />}>
            Ir al Inicio
          </Boton>
        </Link>
        <Link to={RUTAS.eventos}>
          <Boton variante="secundario" icono={<Search className="h-4 w-4" />}>
            Explorar Cartelera
          </Boton>
        </Link>
      </div>
    </div>
  )
}
