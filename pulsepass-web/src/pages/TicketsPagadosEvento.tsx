import { useParams } from 'react-router'

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Tickets Pagados: {eventCode}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Listado de entradas emitidas para control del evento.
      </p>
    </div>
  )
}
