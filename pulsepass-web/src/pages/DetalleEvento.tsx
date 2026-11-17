import { useParams } from 'react-router'

export default function DetalleEvento() {
  const { eventCode } = useParams()
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Detalle del Evento: {eventCode}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Información del evento y compra de entradas.
      </p>
    </div>
  )
}
