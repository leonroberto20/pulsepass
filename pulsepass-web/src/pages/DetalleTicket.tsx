import { useParams } from 'react-router'

export default function DetalleTicket() {
  const { ticketCode } = useParams()
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Ticket: {ticketCode}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Información del pase y código QR para ingreso.
      </p>
    </div>
  )
}
