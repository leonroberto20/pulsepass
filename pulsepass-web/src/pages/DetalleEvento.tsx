import { Link, useParams, useLocation } from 'react-router'
import {
  Calendar,
  MapPin,
  Users,
  Video,
  Ticket,
  Sparkles,
  ArrowLeft,
  LogIn,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useEvento } from '@/funcionalidades/eventos/useEventos'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import type { EventCategory, EventStatus } from '@/funcionalidades/eventos/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Cargando,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

export default function DetalleEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const location = useLocation()
  const { sesion } = useAuth()

  const {
    data: evento,
    isLoading,
    isError,
    error,
    refetch,
  } = useEvento(eventCode)

  if (isLoading) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando detalles del evento..." />
      </div>
    )
  }

  if (isError || !evento) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EstadoError
          titulo="No pudimos encontrar el evento solicitado"
          mensaje={(error as Error)?.message || 'El evento no existe o no se encuentra disponible.'}
          onReintentar={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.eventos}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Regresar a la cartelera
            </Boton>
          </Link>
        </div>
      </div>
    )
  }

  const estaPublicado = evento.status === 'PUBLISHED'
  const estaAgotado = evento.status === 'SOLD_OUT'
  const estaCancelado = evento.status === 'CANCELLED'
  const estaFinalizado = evento.status === 'FINISHED'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Migas de pan (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to={RUTAS.inicio} className="hover:text-marca-600">
          Inicio
        </Link>
        <span>/</span>
        <Link to={RUTAS.eventos} className="hover:text-marca-600">
          Eventos
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
          {evento.name}
        </span>
      </nav>

      {/* Cabecera del Evento */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tono={evento.category as EventCategory} className="text-sm px-3 py-1">
              {evento.category}
            </Badge>
            <Badge tono={evento.status as EventStatus} className="text-sm px-3 py-1">
              {evento.status}
            </Badge>
          </div>
          <span className="font-mono text-sm text-slate-400">
            Código: <strong className="text-slate-700 dark:text-slate-300">{evento.eventCode}</strong>
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {evento.name}
        </h1>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-b border-slate-100 py-6 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-marca-600 dark:text-marca-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Fecha y hora
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {formatearFechaHora(evento.eventDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-marca-600 dark:text-marca-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Sede / Recinto
              </p>
              <Link
                to={RUTAS.sedeDetalle(evento.venueCode)}
                className="mt-1 inline-block text-sm font-bold text-marca-600 hover:underline dark:text-marca-400"
              >
                {evento.venueName}
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-marca-600 dark:text-marca-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Edad mínima
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {evento.minimumAge === 0 ? 'Para todo público (0+)' : `Mayores de ${evento.minimumAge} años`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-marca-600 dark:text-marca-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Transmisión en vivo
              </p>
              {evento.streamingUrl ? (
                <a
                  href={evento.streamingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-bold text-marca-600 hover:underline dark:text-marca-400 truncate max-w-[180px]"
                >
                  Ver Stream Oficial
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Solo presencial</p>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {evento.description && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Acerca del Evento
            </h2>
            <p className="mt-2 text-slate-600 leading-relaxed dark:text-slate-300">
              {evento.description}
            </p>
          </div>
        )}

        {/* Panel de Compra / Estado de Venta */}
        <div className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
          {estaPublicado ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    ¡Venta de entradas disponible!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pases generales, VIP, backstage y estudiantes según aforo.
                  </p>
                </div>
              </div>

              {sesion.estado === 'autenticado' ? (
                <Link to={`/compra/${evento.eventCode}`}>
                  <Boton
                    variante="primario"
                    className="py-3 px-6 text-base font-semibold"
                    icono={<Ticket className="h-5 w-5" />}
                  >
                    Comprar Entradas
                  </Boton>
                </Link>
              ) : (
                <Link to={RUTAS.login} state={{ desde: location.pathname }}>
                  <Boton
                    variante="primario"
                    className="py-2.5 px-5"
                    icono={<LogIn className="h-4 w-4" />}
                  >
                    Iniciar sesión para comprar
                  </Boton>
                </Link>
              )}
            </div>
          ) : estaAgotado ? (
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold">Entradas Agotadas (Sold Out)</h4>
                <p className="text-xs">Este evento ha alcanzado el aforo máximo de la sede.</p>
              </div>
            </div>
          ) : estaCancelado ? (
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold">Evento Cancelado</h4>
                <p className="text-xs">Este evento no se llevará a cabo.</p>
              </div>
            </div>
          ) : estaFinalizado ? (
            <div className="text-slate-500">
              <h4 className="font-bold">Evento Finalizado</h4>
              <p className="text-xs">Este evento ya concluyó.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Artistas en Cartelera */}
      <div className="mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-marca-600 dark:text-marca-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Artistas en Escenario
          </h2>
        </div>

        {evento.artists && evento.artists.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {evento.artists.map((artista) => (
              <Tarjeta
                key={artista.id}
                className="flex flex-col justify-between p-5 hover:border-marca-500 hover:shadow-md transition group"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-marca-600 dark:text-marca-400">
                    {artista.genre || 'Género variado'}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-marca-600 dark:text-white transition-colors">
                    {artista.stageName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {artista.country ? `País: ${artista.country}` : 'Artista internacional'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={RUTAS.artistaDetalle(artista.id)}
                    className="text-xs font-semibold text-marca-600 hover:underline dark:text-marca-400"
                  >
                    Ver perfil del artista →
                  </Link>
                </div>
              </Tarjeta>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 italic">
            Artistas en cartelera pendientes por confirmar por la producción.
          </p>
        )}
      </div>
    </div>
  )
}
