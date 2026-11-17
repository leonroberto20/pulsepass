import clsx from 'clsx'

export interface PrecioCOPProps {
  valor: number | string
  className?: string
}

export function formatearCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto)
}

export function PrecioCOP({ valor, className }: PrecioCOPProps) {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  const texto = isNaN(num) ? '$ 0' : formatearCOP(num)

  return (
    <span className={clsx('font-semibold tracking-tight text-slate-900 dark:text-white', className)}>
      {texto}
    </span>
  )
}
