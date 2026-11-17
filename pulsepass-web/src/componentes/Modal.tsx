import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  anchoMaximo?: string
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
  anchoMaximo = 'max-w-lg',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCerrar()
      }
    }

    if (abierto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', manejarTecla)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', manejarTecla)
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div
        ref={dialogRef}
        className={`relative w-full ${anchoMaximo} z-10 overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200 dark:border-slate-800 dark:bg-slate-900`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2
            id="modal-titulo"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 text-slate-700 dark:text-slate-300">{children}</div>

        {/* Pie */}
        {pie && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            {pie}
          </div>
        )}
      </div>
    </div>
  )
}
