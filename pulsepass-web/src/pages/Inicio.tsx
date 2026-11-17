import { Link } from 'react-router'
import { Calendar, Sparkles, MapPin, ArrowRight } from 'lucide-react'
import { Boton } from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function Inicio() {
  return (
    <div className="flex flex-col gap-12 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marca-600 via-marca-700 to-indigo-900 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-acento-500" />
            La mejor experiencia en boletería
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Vive la música y los mejores eventos
          </h1>
          <p className="mt-4 text-base text-indigo-100 sm:text-lg">
            Compra tus entradas de forma segura, rápida y con validación digital en tiempo real en PulsePass.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to={RUTAS.eventos}>
              <Boton
                variante="primario"
                className="bg-white text-marca-700 hover:bg-slate-100 font-semibold"
                icono={<ArrowRight className="h-4 w-4" />}
              >
                Ver Cartelera
              </Boton>
            </Link>
            <Link to={RUTAS.artistas}>
              <Boton
                variante="fantasma"
                className="text-white border border-white/30 hover:bg-white/10"
              >
                Conocer Artistas
              </Boton>
            </Link>
          </div>
        </div>
      </section>

      {/* Secciones de acceso rápido */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to={RUTAS.eventos}
          className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-marca-500 hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="rounded-xl bg-marca-50 p-3 text-marca-600 w-fit dark:bg-slate-800 dark:text-marca-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-marca-600 dark:text-white">
            Cartelera de Eventos
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Explora conciertos, festivales y eventos culturales disponibles para compra.
          </p>
        </Link>

        <Link
          to={RUTAS.artistas}
          className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-marca-500 hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600 w-fit dark:bg-slate-800 dark:text-purple-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-purple-600 dark:text-white">
            Artistas Destacados
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Conoce el repertorio y las próximas presentaciones de tus artistas favoritos.
          </p>
        </Link>

        <Link
          to={RUTAS.sedes}
          className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:border-marca-500 hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600 w-fit dark:bg-slate-800 dark:text-rose-400">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-rose-600 dark:text-white">
            Sedes y Escenarios
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Encuentra las ubicaciones, capacidades e información de acceso a los recintos.
          </p>
        </Link>
      </section>
    </div>
  )
}
