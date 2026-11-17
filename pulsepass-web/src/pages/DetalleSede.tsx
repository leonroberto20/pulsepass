import { useParams } from 'react-router'

export default function DetalleSede() {
  const { code } = useParams()
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Sede: {code}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Detalle del recinto, aforo y eventos programados.
      </p>
    </div>
  )
}
