import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
  Plus,
  Calendar,
  Settings,
  FilterX,
  Radio,
  FileCheck2,
} from 'lucide-react'
import { useEventosPublicados } from '@/funcionalidades/eventos/useEventos'
import type { EventCategory, EventStatus } from '@/funcionalidades/eventos/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Campo,
  Selector,
  Tabla,
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

export default function AdminEventos() {
  const { data: eventos, isLoading, isError, error, refetch } = useEventosPublicados()

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [vistaTabla, setVistaTabla] = useState(false)

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return []

    return eventos.filter((evt) => {
      const termino = busqueda.trim().toLowerCase()
      const coincideTexto =
        !termino ||
        evt.name.toLowerCase().includes(termino) ||
        evt.eventCode.toLowerCase().includes(termino) ||
        evt.venueName.toLowerCase().includes(termino)

      const coincideCat = !categoria || evt.category === categoria

      return coincideTexto && coincideCat
    })
  }, [eventos, busqueda, categoria])

  const columnas = [
    {
      encabezado: 'Código',
      render: (e: any) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {e.eventCode}
        </span>
      ),
    },
    {
      encabezado: 'Nombre del Evento',
      render: (e: any) => (
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          {e.name}
        </span>
      ),
    },
    {
      encabezado: 'Categoría',
      render: (e: any) => <Badge tono={e.category as EventCategory}>{e.category}</Badge>,
    },
    {
      encabezado: 'Estado',
      render: (e: any) => <Badge tono={e.status as EventStatus}>{e.status}</Badge>,
    },
    {
      encabezado: 'Sede',
      render: (e: any) => <span className="text-xs text-slate-600 dark:text-slate-400">{e.venueName}</span>,
    },
    {
      encabezado: 'Fecha / Hora',
      render: (e: any) => (
        <span className="text-xs text-slate-500">
          {formatearFechaHora(e.eventDate)}
        </span>
      ),
    },
    {
      encabezado: 'Acciones',
      render: (e: any) => (
        <div className="flex items-center gap-2">
          <Link to={RUTAS.adminEventoGestion(e.eventCode)}>
            <Boton variante="secundario" className="text-xs py-1 px-2.5" icono={<Settings className="h-3.5 w-3.5" />}>
              Gestionar
            </Boton>
          </Link>
          <Link to={RUTAS.staffEventoTickets(e.eventCode)}>
            <Boton variante="fantasma" className="text-xs py-1 px-2 text-amber-600 hover:text-amber-700" title="Ver Asistentes">
              <FileCheck2 className="h-3.5 w-3.5" />
            </Boton>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Panel de Operaciones • Administrador
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Gestión de Eventos
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Crea nuevos espectáculos, publica en cartelera y asigna artistas a recintos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={RUTAS.adminCrearEvento}>
            <Boton variante="primario" className="shadow-md" icono={<Plus className="h-4 w-4" />}>
              Crear Nuevo Evento
            </Boton>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="sm:col-span-2">
          <Campo
            etiqueta="Buscar por evento o código"
            placeholder="Ej. Caribbean, CMF-2026..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Selector
              etiqueta="Categoría"
              opciones={CATEGORIAS_OPCIONES}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <Boton
            variante="secundario"
            className="h-10 px-3 text-xs"
            onClick={() => setVistaTabla(!vistaTabla)}
          >
            {vistaTabla ? 'Tarjetas' : 'Tabla'}
          </Boton>

          {(busqueda || categoria) && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setCategoria('')
              }}
              className="flex items-center gap-1 h-10 px-2 text-xs font-semibold text-slate-500 hover:text-purple-600"
            >
              <FilterX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-16">
            <Cargando mensaje="Cargando catálogo operativo de eventos..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <EstadoError
              titulo="Error al consultar eventos"
              mensaje={(error as Error)?.message || 'Ocurrió un error al cargar la lista.'}
              onReintentar={() => refetch()}
            />
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron eventos"
            mensaje="No hay registros que coincidan con los filtros aplicados."
            accion={
              <Link to={RUTAS.adminCrearEvento}>
                <Boton variante="primario" icono={<Plus className="h-4 w-4" />}>
                  Registrar Primer Evento
                </Boton>
              </Link>
            }
          />
        ) : vistaTabla ? (
          <Tarjeta className="overflow-hidden p-0 shadow-sm">
            <Tabla
              columnas={columnas}
              datos={eventosFiltrados}
              claveFila={(e) => e.eventCode}
            />
          </Tarjeta>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evt) => (
              <Tarjeta
                key={evt.eventCode}
                className="flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition p-6 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tono={evt.category as EventCategory}>{evt.category}</Badge>
                    <Badge tono={evt.status as EventStatus}>{evt.status}</Badge>
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 dark:text-white transition-colors">
                    {evt.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatearFechaHora(evt.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{evt.venueName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-400">{evt.eventCode}</span>
                  <div className="flex gap-2">
                    <Link to={RUTAS.staffEventoTickets(evt.eventCode)}>
                      <Boton variante="fantasma" className="text-xs py-1.5 px-2 text-amber-600">
                        Asistentes
                      </Boton>
                    </Link>
                    <Link to={RUTAS.adminEventoGestion(evt.eventCode)}>
                      <Boton
                        variante="primario"
                        className="text-xs py-1.5 bg-purple-600 hover:bg-purple-700"
                        icono={<Settings className="h-3.5 w-3.5" />}
                      >
                        Gestionar
                      </Boton>
                    </Link>
                  </div>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
