import { useState } from 'react'

export default function App() {
  const [contador, setContador] = useState(0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span className="inline-block rounded-full bg-marca-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-marca-600 dark:bg-slate-800 dark:text-marca-500">
          PulsePass Web • Fase 5
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Eventos, Artistas y Entradas
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Frontend con React 19, TypeScript estricto, React Router v8 y Tailwind CSS v4.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setContador((c) => c + 1)}
            className="w-full rounded-lg bg-marca-600 px-4 py-2.5 font-medium text-white transition hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Clicks: {contador}
          </button>
          <span className="text-xs text-acento-500 font-semibold">
            Color de acento configurado correctamente (#f43f5e)
          </span>
        </div>
      </div>
    </div>
  )
}
