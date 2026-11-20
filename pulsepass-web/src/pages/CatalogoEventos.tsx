import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { Calendar, MapPin, ArrowRight, FilterX } from 'lucide-react'
import { useEventosPublicados } from '@/funcionalidades/eventos/useEventos'
import type { EventCategory, EventStatus } from '@/funcionalidades/eventos/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Campo,
  Selector,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

const CATEGORIAS_OPCIONES = [
  { valor: '', etiqueta: 'Todas las categorías' },
  { valor: 'MUSIC', etiqueta: 'Música' },
  { valor: 'SPORTS', etiqueta: 'Deportes' },
  { valor: 'TECHNOLOGY', etiqueta: 'Tecnología' },
  { valor: 'EDUCATION', etiqueta: 'Educación' },
  { valor: 'CULTURE', etiqueta: 'Cultura' },
  { valor: 'ENTERTAINMENT', etiqueta: 'Entretenimiento' },
]

export default function CatalogoEventos() {
  const { data: eventos, isLoading, isError, error, refetch } = useEventosPublicados()

  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return []

    return eventos.filter((evt) => {
      // Filtro texto
      const termino = busqueda.trim().toLowerCase()
      const coincideTexto =
        !termino ||
        evt.name.toLowerCase().includes(termino) ||
        evt.eventCode.toLowerCase().includes(termino) ||
        evt.venueName.toLowerCase().includes(termino)

      // Filtro categoría
      const coincideCat = !categoriaSeleccionada || evt.category === categoriaSeleccionada

      // Filtro disponibilidad
      const coincideDisp = !soloDisponibles || evt.status === 'PUBLISHED'

      return coincideTexto && coincideCat && coincideDisp
    })
  }, [eventos, busqueda, categoriaSeleccionada, soloDisponibles])

  function limpiarFiltros() {
    setBusqueda('')
    setCategoriaSeleccionada('')
    setSoloDisponibles(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-marca-600 dark:text-marca-400">
            Cartelera Oficial
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Eventos en Vivo
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Explora los conciertos, festivales y experiencias disponibles en PulsePass.
          </p>
        </div>

        {eventos && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Mostrando <span className="font-bold text-slate-900 dark:text-white">{eventosFiltrados.length}</span> de {eventos.length} eventos
          </p>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="lg:col-span-2">
          <Campo
            etiqueta="Buscar por evento, código o recinto"
            placeholder="Ej. Caribbean Music Fest, Marina..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div>
          <Selector
            etiqueta="Categoría"
            opciones={CATEGORIAS_OPCIONES}
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-2 h-10 pb-0.5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-marca-600 focus:ring-marca-500"
            />
            Solo con venta activa
          </label>

          {(busqueda || categoriaSeleccionada || soloDisponibles) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-marca-600 dark:text-slate-400 dark:hover:text-marca-400"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-16">
            <Cargando mensaje="Cargando cartelera de eventos..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <EstadoError
              titulo="No pudimos cargar la cartelera de eventos"
              mensaje={(error as Error)?.message || 'Ocurrió un error al consultar los eventos del servidor.'}
              onReintentar={() => refetch()}
            />
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron eventos"
            mensaje="No hay eventos que coincidan con los filtros aplicados. Intenta con otros términos o limpia los filtros."
            accion={
              (busqueda || categoriaSeleccionada || soloDisponibles) && (
                <Boton variante="secundario" onClick={limpiarFiltros}>
                  Restablecer filtros
                </Boton>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => (
              <Tarjeta
                key={evento.eventCode}
                className="flex flex-col justify-between hover:border-marca-500 hover:shadow-md transition group"
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

                  <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 group-hover:text-marca-600 dark:text-white dark:group-hover:text-marca-400 transition-colors">
                    {evento.name}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{formatearFechaHora(evento.eventDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{evento.venueName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    {evento.eventCode}
                  </span>
                  <Link to={RUTAS.eventoDetalle(evento.eventCode)}>
                    <Boton
                      variante="primario"
                      className="text-xs py-1.5"
                      icono={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Ver Detalle
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
