import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { QrCode, Calendar, ArrowRight, DollarSign } from 'lucide-react'
import { useMisTickets } from '@/funcionalidades/tickets/useTickets'
import type { TicketStatus } from '@/funcionalidades/tickets/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Selector,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora, formatearCOP } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'PAID', etiqueta: 'Pagadas (Activas)' },
  { valor: 'USED', etiqueta: 'Usadas (Ingresadas)' },
  { valor: 'CANCELLED', etiqueta: 'Canceladas' },
]

export default function MisTickets() {
  const { data: tickets, isLoading, isError, error, refetch } = useMisTickets()
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  const ticketsFiltrados = useMemo(() => {
    if (!tickets) return []
    if (!filtroEstado) return tickets
    return tickets.filter((t) => t.status === filtroEstado)
  }, [tickets, filtroEstado])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-marca-600 dark:text-marca-400">
            Mi Billetera Digital
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Mis Entradas
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Administra tus pases digitales y códigos QR de acceso a los eventos en PulsePass.
          </p>
        </div>

        {tickets && tickets.length > 0 && (
          <div className="w-full sm:w-56">
            <Selector
              aria-label="Filtrar por estado de entrada"
              opciones={OPCIONES_ESTADO}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-16">
            <Cargando mensaje="Cargando tus entradas..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <EstadoError
              titulo="No pudimos cargar tus entradas"
              mensaje={(error as Error)?.message || 'Ocurrió un error al consultar tus boletos.'}
              onReintentar={() => refetch()}
            />
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <EstadoVacio
            titulo={filtroEstado ? 'No hay entradas con el estado seleccionado' : 'Aún no tienes entradas'}
            mensaje={
              filtroEstado
                ? 'Prueba seleccionando otro filtro de estado.'
                : 'Explora nuestra cartelera de eventos en vivo y asegura tus boletos hoy mismo.'
            }
            accion={
              filtroEstado ? (
                <Boton variante="secundario" onClick={() => setFiltroEstado('')}>
                  Ver todas mis entradas
                </Boton>
              ) : (
                <Link to={RUTAS.eventos}>
                  <Boton variante="primario" icono={<ArrowRight className="h-4 w-4" />}>
                    Explorar Cartelera
                  </Boton>
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketsFiltrados.map((ticket) => (
              <Tarjeta
                key={ticket.ticketCode}
                className="flex flex-col justify-between overflow-hidden hover:border-marca-500 hover:shadow-md transition p-0 group"
              >
                {/* Cabecera del Pase */}
                <div className="bg-slate-50 p-5 border-b border-dashed border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{ticket.ticketCode}
                    </span>
                    <Badge tono={ticket.status as TicketStatus}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    Evento: {ticket.eventCode}
                  </h3>
                </div>

                {/* Cuerpo del Pase */}
                <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Localidad:</span>
                    <Badge tono={ticket.type}>{ticket.type}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Emisión:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatearFechaHora(ticket.purchaseDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-slate-500">
                      <DollarSign className="h-3.5 w-3.5" />
                      Precio:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatearCOP(ticket.price)}
                    </span>
                  </div>
                </div>

                {/* Pie con botón de acceso */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                  <Link to={RUTAS.ticketDetalle(ticket.ticketCode)}>
                    <Boton
                      variante="primario"
                      className="w-full justify-center text-xs py-2 shadow-xs"
                      icono={<QrCode className="h-3.5 w-3.5" />}
                    >
                      Ver Pase Digital y QR
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
