import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Ticket,
  UserCheck,
} from 'lucide-react'
import { useTicketsPagadosPorEvento, useMarcarTicketUsado } from '@/funcionalidades/tickets/useTickets'
import { useEvento } from '@/funcionalidades/eventos/useEventos'
import type { TicketResponse } from '@/funcionalidades/tickets/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Campo,
  Tabla,
  Aviso,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora, formatearCOP } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()

  const {
    data: evento,
    isLoading: cargandoEvento,
  } = useEvento(eventCode)

  const {
    data: tickets,
    isLoading: cargandoTickets,
    isError,
    error,
    refetch,
  } = useTicketsPagadosPorEvento(eventCode)

  const marcarUsadoMutation = useMarcarTicketUsado()
  const [busqueda, setBusqueda] = useState('')
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [exitoAccion, setExitoAccion] = useState<string | null>(null)

  const ticketsFiltrados = useMemo(() => {
    if (!tickets) return []
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return tickets

    return tickets.filter(
      (t) =>
        t.ticketCode.toLowerCase().includes(termino) ||
        t.userEmail.toLowerCase().includes(termino) ||
        t.type.toLowerCase().includes(termino),
    )
  }, [tickets, busqueda])

  async function handleValidarTicket(ticketCode: string) {
    setErrorAccion(null)
    setExitoAccion(null)
    try {
      await marcarUsadoMutation.mutateAsync(ticketCode)
      setExitoAccion(`Ticket ${ticketCode} validado exitosamente en puerta.`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorAccion(err.message || 'Error al validar ticket.')
      } else {
        setErrorAccion('No se pudo conectar con el servidor.')
      }
    }
  }

  const columnas = [
    {
      encabezado: 'Código Ticket',
      render: (t: TicketResponse) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {t.ticketCode}
        </span>
      ),
    },
    {
      encabezado: 'Titular / Correo',
      render: (t: TicketResponse) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {t.userEmail}
        </span>
      ),
    },
    {
      encabezado: 'Localidad',
      render: (t: TicketResponse) => <Badge tono={t.type}>{t.type}</Badge>,
    },
    {
      encabezado: 'Estado',
      render: (t: TicketResponse) => <Badge tono={t.status}>{t.status}</Badge>,
    },
    {
      encabezado: 'Fecha Compra',
      render: (t: TicketResponse) => (
        <span className="text-xs text-slate-500">
          {formatearFechaHora(t.purchaseDate)}
        </span>
      ),
    },
    {
      encabezado: 'Precio',
      render: (t: TicketResponse) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {formatearCOP(t.price)}
        </span>
      ),
    },
    {
      encabezado: 'Acción Operativa',
      render: (t: TicketResponse) =>
        t.status === 'PAID' ? (
          <Boton
            variante="primario"
            className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleValidarTicket(t.ticketCode)}
            cargando={marcarUsadoMutation.isPending}
            icono={<UserCheck className="h-3.5 w-3.5" />}
          >
            Validar
          </Boton>
        ) : t.status === 'USED' ? (
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Ingresado
          </span>
        ) : (
          <span className="text-xs font-medium text-red-500">Cancelado</span>
        ),
    },
  ]

  if (cargandoTickets || cargandoEvento) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando lista de asistentes y tickets pagados..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EstadoError
          titulo="Error al consultar asistentes del evento"
          mensaje={(error as Error)?.message || 'No se pudieron consultar los boletos.'}
          onReintentar={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.staffValidacion}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Ir a Validación Individual
            </Boton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Botón Volver */}
      <div className="mb-6">
        <Link to={RUTAS.staffValidacion}>
          <Boton variante="fantasma" icono={<ArrowLeft className="h-4 w-4" />}>
            Volver a Control de Acceso
          </Boton>
        </Link>
      </div>

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Staff Operativo • Padrón de Asistentes
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {evento ? evento.name : `Evento ${eventCode}`}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Listado oficial de entradas pagadas para el control de aforo y torniquetes.
          </p>
        </div>

        {tickets && (
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {tickets.length} entradas emitidas
            </span>
          </div>
        )}
      </div>

      {/* Alertas */}
      {errorAccion && (
        <div className="mt-6">
          <Aviso tipo="error" onCerrar={() => setErrorAccion(null)}>
            {errorAccion}
          </Aviso>
        </div>
      )}

      {exitoAccion && (
        <div className="mt-6">
          <Aviso tipo="exito" onCerrar={() => setExitoAccion(null)}>
            {exitoAccion}
          </Aviso>
        </div>
      )}

      {/* Buscador */}
      <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <Campo
          etiqueta="Filtrar asistentes"
          placeholder="Buscar por código de ticket, correo del titular o localidad (ej. VIP, andrea@)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de Asistentes */}
      <div className="mt-8">
        {!tickets || tickets.length === 0 ? (
          <EstadoVacio
            titulo="No hay tickets pagados para este evento"
            mensaje="Aún no se han registrado compras o reservas confirmadas para este evento."
            icono={<Ticket className="h-10 w-10 text-slate-400" />}
          />
        ) : ticketsFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="Sin coincidencias"
            mensaje="No hay tickets que coincidan con el término de búsqueda ingresado."
            accion={
              <Boton variante="secundario" onClick={() => setBusqueda('')}>
                Limpiar búsqueda
              </Boton>
            }
          />
        ) : (
          <Tarjeta className="overflow-hidden p-0">
            <Tabla
              columnas={columnas}
              datos={ticketsFiltrados}
              claveFila={(t) => t.ticketCode}
            />
          </Tarjeta>
        )}
      </div>
    </div>
  )
}
