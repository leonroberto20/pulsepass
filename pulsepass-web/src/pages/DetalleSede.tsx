import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { MapPin, Users, Building, Calendar, ArrowLeft, ArrowRight } from 'lucide-react'
import { useSede } from '@/funcionalidades/sedes/useSedes'
import { useEventosPublicados } from '@/funcionalidades/eventos/useEventos'
import type { EventCategory, EventStatus } from '@/funcionalidades/eventos/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

export default function DetalleSede() {
  const { code } = useParams<{ code: string }>()

  const {
    data: sede,
    isLoading: cargandoSede,
    isError: errorSede,
    error: errSede,
    refetch: reintentarSede,
  } = useSede(code)

  const { data: todosLosEventos, isLoading: cargandoEventos } = useEventosPublicados()

  const eventosSede = useMemo(() => {
    if (!todosLosEventos || !sede) return []
    return todosLosEventos.filter(
      (e) => e.venueName.toLowerCase() === sede.name.toLowerCase(),
    )
  }, [todosLosEventos, sede])

  if (cargandoSede) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando información del recinto..." />
      </div>
    )
  }

  if (errorSede || !sede) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EstadoError
          titulo="No pudimos encontrar el recinto solicitado"
          mensaje={(errSede as Error)?.message || 'La sede no existe o no se encuentra disponible.'}
          onReintentar={() => reintentarSede()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.sedes}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Regresar al catálogo de sedes
            </Boton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Migas de pan */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to={RUTAS.inicio} className="hover:text-marca-600">
          Inicio
        </Link>
        <span>/</span>
        <Link to={RUTAS.sedes} className="hover:text-marca-600">
          Sedes
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
          {sede.name}
        </span>
      </nav>

      {/* Cabecera de la Sede */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-rose-100 text-rose-700 dark:bg-slate-800 dark:text-rose-400 text-3xl font-extrabold shadow-inner">
            <Building className="h-12 w-12" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                Código: {sede.code}
              </span>
              <Badge tono={sede.active ? 'exito' : 'error'}>
                {sede.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {sede.name}
            </h1>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{sede.address}, {sede.city}</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Users className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  Capacidad máxima: <strong>{sede.capacity.toLocaleString('es-CO')} personas</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos en la Sede */}
      <div className="mt-12">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Eventos en este Recinto
          </h2>
        </div>

        {cargandoEventos ? (
          <div className="py-12">
            <Cargando mensaje="Buscando eventos programados..." />
          </div>
        ) : eventosSede.length === 0 ? (
          <div className="mt-6">
            <EstadoVacio
              titulo="Sin eventos programados actualmente"
              mensaje="No hay eventos próximos en cartelera para esta sede."
              accion={
                <Link to={RUTAS.eventos}>
                  <Boton variante="secundario">Explorar cartelera completa</Boton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosSede.map((evento) => (
              <Tarjeta
                key={evento.eventCode}
                className="flex flex-col justify-between hover:border-rose-500 hover:shadow-md transition group p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tono={evento.category as EventCategory}>
                      {evento.category}
                    </Badge>
                    <Badge tono={evento.status as EventStatus}>
                      {evento.status}
                    </Badge>
                  </div>

                  <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 group-hover:text-rose-600 dark:text-white transition-colors">
                    {evento.name}
                  </h3>

                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatearFechaHora(evento.eventDate)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link to={RUTAS.eventoDetalle(evento.eventCode)}>
                    <Boton
                      variante="primario"
                      className="w-full text-xs py-1.5 justify-center"
                      icono={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Ver Detalle y Boletos
                    </Boton>
                  </Link>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
