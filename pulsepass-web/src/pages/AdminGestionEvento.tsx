import { useParams } from 'react-router'

export default function AdminGestionEvento() {
  const { eventCode } = useParams()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Gestión de Evento: {eventCode}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Publicar, cancelar, finalizar y asociar artistas.
      </p>
    </div>
  )
}
