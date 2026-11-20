import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Ticket,
  AlertOctagon,
  Printer,
} from 'lucide-react'
import { useTicket, useCancelarTicket } from '@/funcionalidades/tickets/useTickets'
import type { TicketStatus } from '@/funcionalidades/tickets/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Modal,
  Aviso,
  Cargando,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora, formatearCOP } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

export default function DetalleTicket() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const { data: ticket, isLoading, isError, error, refetch } = useTicket(ticketCode)

  const cancelarTicketMutation = useCancelarTicket()
  const [modalCancelarAbierta, setModalCancelarAbierta] = useState(false)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando tu entrada digital..." />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EstadoError
          titulo="Entrada no encontrada"
          mensaje={(error as Error)?.message || 'El ticket no existe o no tienes permisos para visualizarlo.'}
          onReintentar={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.misTickets}>
            <Boton variante="secundario" icono={<ArrowLeft className="h-4 w-4" />}>
              Volver a mis entradas
            </Boton>
          </Link>
        </div>
      </div>
    )
  }

  const esValido = ticket.status === 'PAID'
  const esUsado = ticket.status === 'USED'
  const esCancelado = ticket.status === 'CANCELLED'

  async function handleCancelarTicket() {
    if (!ticket) return
    setErrorCancelacion(null)
    try {
      await cancelarTicketMutation.mutateAsync(ticket.ticketCode)
      setModalCancelarAbierta(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorCancelacion(err.message || 'Error al solicitar cancelación.')
      } else {
        setErrorCancelacion('No se pudo conectar con el servidor.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Botón de regreso */}
      <div className="mb-6">
        <Link to={RUTAS.misTickets}>
          <Boton variante="fantasma" icono={<ArrowLeft className="h-4 w-4" />}>
            Volver a mis entradas
          </Boton>
        </Link>
      </div>

      {/* Pase Digital (Card estilo Boleto) */}
      <Tarjeta className="overflow-hidden p-0 shadow-2xl border-2 border-slate-300 dark:border-slate-700">
        {/* Cabecera del Pase */}
        <div className="bg-gradient-to-r from-marca-600 to-indigo-800 p-6 text-white sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6 rotate-12" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                PulsePass Digital Pass
              </span>
            </div>
            <Badge tono={ticket.status as TicketStatus} className="text-xs px-3 py-1">
              {ticket.status}
            </Badge>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
            Evento: {ticket.eventCode}
          </h1>

          <p className="mt-1 font-mono text-xs text-indigo-200">
            Pase #{ticket.ticketCode}
          </p>
        </div>

        {/* Sección de Código QR Simulado */}
        <div className="bg-white p-8 text-center dark:bg-slate-900 border-b border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-4 border-slate-900 bg-white p-3 shadow-inner dark:border-slate-100 dark:bg-white">
            {/* SVG estilizado de código QR con patrón real */}
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full fill-slate-900 text-slate-900"
              aria-label={`Código QR para el pase ${ticket.ticketCode}`}
            >
              {/* Esquinas QR (Finders) */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="13" width="12" height="12" rx="2" />
              <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="75" y="13" width="12" height="12" rx="2" />
              <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="75" width="12" height="12" rx="2" />
              {/* Patrones de datos interiores */}
              <rect x="38" y="10" width="8" height="8" />
              <rect x="52" y="10" width="6" height="6" />
              <rect x="42" y="24" width="16" height="8" />
              <rect x="10" y="40" width="8" height="8" />
              <rect x="24" y="44" width="8" height="14" />
              <rect x="38" y="38" width="10" height="10" />
              <rect x="54" y="38" width="8" height="16" />
              <rect x="70" y="40" width="12" height="6" />
              <rect x="85" y="44" width="6" height="14" />
              <rect x="40" y="56" width="8" height="8" />
              <rect x="40" y="72" width="14" height="6" />
              <rect x="60" y="64" width="12" height="12" />
              <rect x="78" y="68" width="14" height="14" />
              <rect x="40" y="84" width="18" height="8" />
            </svg>
          </div>

          <p className="mt-3 font-mono text-sm font-extrabold tracking-wider text-slate-900 dark:text-white">
            {ticket.ticketCode}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {esValido && 'Presenta este código en el acceso al evento para su validación.'}
            {esUsado && 'Este pase ya fue validado en el acceso del recinto.'}
            {esCancelado && 'Este pase se encuentra cancelado y no permite ingreso.'}
          </p>
        </div>

        {/* Detalles del Boleto */}
        <div className="bg-slate-50/70 p-6 sm:p-8 dark:bg-slate-800/40 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Tipo de Localidad</span>
              <div className="mt-1">
                <Badge tono={ticket.type} className="text-sm px-2.5 py-0.5">
                  {ticket.type}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Total Pagado</span>
              <p className="mt-1 font-extrabold text-slate-900 dark:text-white text-base">
                {formatearCOP(ticket.price)}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Titular de la Entrada</span>
              <p className="mt-1 font-medium text-slate-900 dark:text-white truncate">
                {ticket.userEmail}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Fecha de Emisión</span>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">
                {formatearFechaHora(ticket.purchaseDate)}
              </p>
            </div>
          </div>

          {/* Acciones del Boleto */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
            <Boton
              variante="secundario"
              onClick={() => window.print()}
              icono={<Printer className="h-4 w-4" />}
            >
              Imprimir Boleto
            </Boton>

            {esValido && (
              <Boton
                variante="peligro"
                onClick={() => setModalCancelarAbierta(true)}
                icono={<AlertOctagon className="h-4 w-4" />}
              >
                Cancelar Boleto
              </Boton>
            )}
          </div>
        </div>
      </Tarjeta>

      {/* Modal de Cancelación */}
      {modalCancelarAbierta && (
        <Modal
          abierto={modalCancelarAbierta}
          onCerrar={() => setModalCancelarAbierta(false)}
          titulo="¿Deseas cancelar esta entrada?"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estás a punto de cancelar la entrada <strong>{ticket.ticketCode}</strong> para el evento{' '}
              <strong>{ticket.eventCode}</strong>. Esta acción liberará el aforo en la sede.
            </p>

            {errorCancelacion && (
              <Aviso tipo="error" titulo="Error al cancelar">
                {errorCancelacion}
              </Aviso>
            )}

            <div className="flex gap-3 pt-2">
              <Boton
                variante="secundario"
                onClick={() => setModalCancelarAbierta(false)}
                className="flex-1"
                disabled={cancelarTicketMutation.isPending}
              >
                Regresar
              </Boton>
              <Boton
                variante="peligro"
                onClick={handleCancelarTicket}
                cargando={cancelarTicketMutation.isPending}
                className="flex-1"
              >
                Sí, Cancelar Entrada
              </Boton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
