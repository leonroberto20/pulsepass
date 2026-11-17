import { useParams } from 'react-router'

export default function DetalleArtista() {
  const { id } = useParams()
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Artista #{id}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Perfil y eventos del artista.
      </p>
    </div>
  )
}
