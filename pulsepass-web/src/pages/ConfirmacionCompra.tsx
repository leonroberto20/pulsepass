import { Link, useParams } from 'react-router'
import { CheckCircle2, Ticket, QrCode, ArrowRight, Calendar, User, DollarSign } from 'lucide-react'
import { useTicket } from '@/funcionalidades/tickets/useTickets'
import {
  Tarjeta,
  Badge,
  Boton,
  Cargando,
  EstadoError,
} from '@/componentes'
import { formatearFechaHora, formatearCOP } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const { data: ticket, isLoading, isError, error, refetch } = useTicket(ticketCode)

  if (isLoading) {
    return (
      <div className="py-24">
        <Cargando mensaje="Cargando confirmación de compra..." />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EstadoError
          titulo="No pudimos encontrar la información de la compra"
          mensaje={(error as Error)?.message || 'El ticket solicitado no fue encontrado.'}
          onReintentar={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to={RUTAS.misTickets}>
            <Boton variante="secundario">Ir a Mis Tickets</Boton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Transacción Exitosa
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          ¡Entrada Emitida con Éxito!
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Tu boleto digital ha sido generado y registrado de forma segura en PulsePass.
        </p>
      </div>

      <Tarjeta className="mt-8 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="border-b border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Código de Ticket</span>
            <Badge tono={ticket.status}>{ticket.status}</Badge>
          </div>
          <p className="mt-1 font-mono text-xl font-extrabold tracking-wider text-slate-900 dark:text-white">
            {ticket.ticketCode}
          </p>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Ticket className="h-4 w-4" />
              Código de Evento:
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {ticket.eventCode}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <User className="h-4 w-4" />
              Titular:
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {ticket.userEmail}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              Fecha de Compra:
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatearFechaHora(ticket.purchaseDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Tipo de Localidad:</span>
            <Badge tono={ticket.type}>{ticket.type}</Badge>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <DollarSign className="h-4 w-4 text-slate-400" />
              Total Pagado:
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formatearCOP(ticket.price)}
            </span>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <Link to={RUTAS.ticketDetalle(ticket.ticketCode)}>
            <Boton
              variante="primario"
              className="w-full justify-center py-2.5 font-semibold"
              icono={<QrCode className="h-4 w-4" />}
            >
              Ver Entrada Digital y Código QR
            </Boton>
          </Link>

          <div className="flex gap-3">
            <Link to={RUTAS.misTickets} className="flex-1">
              <Boton variante="secundario" className="w-full justify-center text-xs py-2">
                Mis Entradas
              </Boton>
            </Link>
            <Link to={RUTAS.eventos} className="flex-1">
              <Boton
                variante="fantasma"
                className="w-full justify-center text-xs py-2"
                icono={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Seguir Explorando
              </Boton>
            </Link>
          </div>
        </div>
      </Tarjeta>
    </div>
  )
}
