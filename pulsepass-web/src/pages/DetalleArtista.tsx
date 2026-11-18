import { Link, useParams } from 'react-router'
import { Sparkles, Globe, Music, Calendar, MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { useArtista } from '@/funcionalidades/artistas/useArtistas'
import { useEventosPorArtista } from '@/funcionalidades/eventos/useEventos'
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

export default function DetalleArtista() {
  const { id } = useParams<{ id: string }>()

  const {
    data: artista,
    isLoading: cargandoArtista,
    isError: errorArtista,
    error: errArtista,
    refetch: reintentarArtista,
  } = useArtista(id)

  const {
    data: eventosArtista,
    isLoading: cargandoEventos,
  } = useEventosPorArtista(artista?.stageName)

  if (cargandoArtista) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando información del artista..." />
      </div>
    )
  }

  if (errorArtista || !artista) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EstadoError
          titulo="No pudimos encontrar al artista solicitado"
          mensaje={(errArtista as Error)?.message || 'El artista no existe o no se encuentra activo.'}
          onReintentar={() => reintentarArtista()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.artistas}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Regresar al directorio de artistas
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
        <Link to={RUTAS.artistas} className="hover:text-marca-600">
          Artistas
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
          {artista.stageName}
        </span>
      </nav>

      {/* Cabecera del Artista */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-purple-100 text-purple-700 dark:bg-slate-800 dark:text-purple-400 text-3xl font-extrabold shadow-inner">
            <Sparkles className="h-12 w-12" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono text-slate-400">ID #{artista.id}</span>
              <Badge tono={artista.active ? 'exito' : 'error'}>
                {artista.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {artista.stageName}
            </h1>

            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Género: <strong>{artista.genre || 'Variado'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>País de origen: <strong>{artista.country || 'Internacional'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Eventos del Artista */}
      <div className="mt-12">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Presentaciones y Conciertos
          </h2>
        </div>

        {cargandoEventos ? (
          <div className="py-12">
            <Cargando mensaje="Buscando eventos programados..." />
          </div>
        ) : !eventosArtista || eventosArtista.length === 0 ? (
          <div className="mt-6">
            <EstadoVacio
              titulo="Sin eventos próximos programados"
              mensaje={`${artista.stageName} no tiene presentaciones en cartelera actualmente.`}
              accion={
                <Link to={RUTAS.eventos}>
                  <Boton variante="secundario">Explorar otros eventos</Boton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosArtista.map((evento) => (
              <Tarjeta
                key={evento.eventCode}
                className="flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition group p-5"
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

                  <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 group-hover:text-purple-600 dark:text-white transition-colors">
                    {evento.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatearFechaHora(evento.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{evento.venueName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link to={RUTAS.eventoDetalle(evento.eventCode)}>
                    <Boton
                      variante="primario"
                      className="w-full text-xs py-1.5 justify-center"
                      icono={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Ver Evento y Entradas
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
