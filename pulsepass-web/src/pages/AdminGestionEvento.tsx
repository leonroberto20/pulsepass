import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  PlusCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import {
  useEvento,
  usePublicarEvento,
  useAgregarArtistaAEvento,
} from '@/funcionalidades/eventos/useEventos'
import { useArtistasActivos } from '@/funcionalidades/artistas/useArtistas'
import type { EventCategory, EventStatus } from '@/funcionalidades/eventos/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Selector,
  Modal,
  Aviso,
  Cargando,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

export default function AdminGestionEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()

  const {
    data: evento,
    isLoading: cargandoEvento,
    isError,
    error,
    refetch,
  } = useEvento(eventCode)

  const { data: artistasActivos, isLoading: cargandoArtistas } = useArtistasActivos()

  const publicarMutation = usePublicarEvento()
  const agregarArtistaMutation = useAgregarArtistaAEvento()

  const [modalPublicarAbierta, setModalPublicarAbierta] = useState(false)
  const [modalAgregarArtistaAbierta, setModalAgregarArtistaAbierta] = useState(false)
  const [artistaSeleccionadoId, setArtistaSeleccionadoId] = useState<string>('')

  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [exitoAccion, setExitoAccion] = useState<string | null>(null)

  if (cargandoEvento) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando consola de gestión del evento..." />
      </div>
    )
  }

  if (isError || !evento) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EstadoError
          titulo="Error al cargar evento"
          mensaje={(error as Error)?.message || 'El evento no fue encontrado.'}
          onReintentar={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.adminEventos}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Volver a lista de eventos
            </Boton>
          </Link>
        </div>
      </div>
    )
  }

  const esBorrador = evento.status === 'DRAFT'
  const esPublicado = evento.status === 'PUBLISHED'

  // Artistas aún no asignados a este evento
  const artistasDisponibles = (artistasActivos || []).filter(
    (art) => !evento.artists.some((ea) => ea.id === art.id),
  )

  const opcionesArtistas = [
    { valor: '', etiqueta: cargandoArtistas ? 'Cargando catálogo...' : 'Selecciona un artista...' },
    ...artistasDisponibles.map((a) => ({
      valor: String(a.id),
      etiqueta: `${a.stageName} (${a.genre || 'Género variado'} - ${a.country || 'Internacional'})`,
    })),
  ]

  async function handlePublicar() {
    if (!evento) return
    setErrorAccion(null)
    setExitoAccion(null)
    try {
      await publicarMutation.mutateAsync(evento.eventCode)
      setModalPublicarAbierta(false)
      setExitoAccion(`¡El evento ${evento.eventCode} ha sido PUBLICADO en la cartelera oficial!`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorAccion(err.message || 'Error al publicar evento.')
      } else {
        setErrorAccion('No se pudo conectar con el servidor.')
      }
    }
  }

  async function handleAgregarArtista() {
    if (!evento || !artistaSeleccionadoId) return
    setErrorAccion(null)
    setExitoAccion(null)
    try {
      await agregarArtistaMutation.mutateAsync({
        eventCode: evento.eventCode,
        artistId: artistaSeleccionadoId,
      })
      setModalAgregarArtistaAbierta(false)
      setArtistaSeleccionadoId('')
      setExitoAccion('Artista agregado exitosamente a la cartelera del evento.')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorAccion(err.message || 'Error al vincular artista.')
      } else {
        setErrorAccion('No se pudo conectar con el servidor.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Botón Volver */}
      <div className="mb-6">
        <Link to={RUTAS.adminEventos}>
          <Boton variante="fantasma" icono={<ArrowLeft className="h-4 w-4" />}>
            Volver a la gestión de eventos
          </Boton>
        </Link>
      </div>

      {/* Cabecera del Evento */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                #{evento.eventCode}
              </span>
              <Badge tono={evento.category as EventCategory}>{evento.category}</Badge>
              <Badge tono={evento.status as EventStatus}>{evento.status}</Badge>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {evento.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sede: <strong>{evento.venueName}</strong> ({evento.venueCode})
            </p>
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <Link to={RUTAS.staffEventoTickets(evento.eventCode)}>
              <Boton variante="secundario" icono={<FileText className="h-4 w-4" />}>
                Ver Asistentes ({evento.status})
              </Boton>
            </Link>

            {esBorrador && (
              <Boton
                variante="primario"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
                onClick={() => setModalPublicarAbierta(true)}
                icono={<CheckCircle className="h-4 w-4" />}
              >
                Publicar Evento
              </Boton>
            )}

            {esPublicado && (
              <Link to={RUTAS.eventoDetalle(evento.eventCode)}>
                <Boton variante="secundario">Ver en Cartelera Pública</Boton>
              </Link>
            )}
          </div>
        </div>

        {/* Ficha rápida */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Fecha: <strong>{formatearFechaHora(evento.eventDate)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span>Recinto: <strong>{evento.venueName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Edad mínima: <strong>{evento.minimumAge}+</strong></span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {errorAccion && (
        <div className="mt-6">
          <Aviso tipo="error" titulo="Operación no completada" onCerrar={() => setErrorAccion(null)}>
            {errorAccion}
          </Aviso>
        </div>
      )}

      {exitoAccion && (
        <div className="mt-6">
          <Aviso tipo="exito" titulo="Operación exitosa" onCerrar={() => setExitoAccion(null)}>
            {exitoAccion}
          </Aviso>
        </div>
      )}

      {/* Sección de Artistas en Cartelera */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Line-up de Artistas ({evento.artists.length})
            </h2>
          </div>

          <Boton
            variante="secundario"
            onClick={() => setModalAgregarArtistaAbierta(true)}
            icono={<PlusCircle className="h-4 w-4" />}
          >
            Vincular Artista
          </Boton>
        </div>

        {evento.artists.length === 0 ? (
          <Tarjeta className="mt-4 p-8 text-center bg-slate-50 border-dashed dark:bg-slate-800/40">
            <p className="text-sm text-slate-500">
              No hay artistas asignados a este evento aún. Haz clic en "Vincular Artista" para agregar músicos o agrupaciones.
            </p>
          </Tarjeta>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {evento.artists.map((artista) => (
              <Tarjeta key={artista.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {artista.stageName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {artista.genre || 'Género no especificado'} • {artista.country || 'Internacional'}
                  </p>
                </div>
                <Badge tono="exito">Confirmado</Badge>
              </Tarjeta>
            ))}
          </div>
        )}
      </div>

      {/* Modal Publicar Evento */}
      {modalPublicarAbierta && (
        <Modal
          abierto={modalPublicarAbierta}
          onCerrar={() => setModalPublicarAbierta(false)}
          titulo="¿Publicar este evento en la cartelera?"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Venta pública inmediata</p>
                <p className="mt-1 text-xs">
                  Al publicar el evento <strong>{evento.eventCode}</strong>, pasará de estado DRAFT a PUBLISHED y los usuarios podrán adquirir boletos según el aforo de la sede.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Boton
                variante="secundario"
                onClick={() => setModalPublicarAbierta(false)}
                className="flex-1"
                disabled={publicarMutation.isPending}
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePublicar}
                cargando={publicarMutation.isPending}
              >
                Confirmar y Publicar
              </Boton>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Vincular Artista */}
      {modalAgregarArtistaAbierta && (
        <Modal
          abierto={modalAgregarArtistaAbierta}
          onCerrar={() => setModalAgregarArtistaAbierta(false)}
          titulo="Vincular Artista al Evento"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Selecciona un artista activo del catálogo para agregarlo al line-up de{' '}
              <strong>{evento.name}</strong>.
            </p>

            <Selector
              etiqueta="Artista del catálogo"
              opciones={opcionesArtistas}
              value={artistaSeleccionadoId}
              onChange={(e) => setArtistaSeleccionadoId(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <Boton
                variante="secundario"
                onClick={() => setModalAgregarArtistaAbierta(false)}
                className="flex-1"
                disabled={agregarArtistaMutation.isPending}
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleAgregarArtista}
                disabled={!artistaSeleccionadoId}
                cargando={agregarArtistaMutation.isPending}
              >
                Agregar Artista
              </Boton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
