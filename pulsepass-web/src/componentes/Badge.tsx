import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { EventStatus } from '@/funcionalidades/eventos/tipos'
import type { TicketStatus, TicketType } from '@/funcionalidades/tickets/tipos'
import type { Rol } from '@/lib/esquemasComunes'

export type TonoBadge =
  | EventStatus
  | TicketStatus
  | TicketType
  | Rol
  | 'exito'
  | 'error'
  | 'advertencia'
  | 'info'
  | 'neutro'

const ESTILOS_BADGE: Record<TonoBadge, string> = {
  // EventStatus
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300',

  // TicketStatus
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300',

  // TicketType
  GENERAL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  VIP: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  BACKSTAGE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  STUDENT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',

  // Roles
  USER: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  STAFF: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',

  // Tonos semánticos
  exito: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  advertencia: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  neutro: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export interface BadgeProps {
  tono: TonoBadge
  children: ReactNode
  className?: string
}

export function Badge({ tono, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        ESTILOS_BADGE[tono] || ESTILOS_BADGE.neutro,
        className,
      )}
    >
      {children}
    </span>
  )
}
