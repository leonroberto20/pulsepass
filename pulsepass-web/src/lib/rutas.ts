/**
 * Mapa centralizado y fuertemente tipado de rutas de PulsePass (PRD §8)
 */
export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  eventoDetalle: (eventCode: string) => `/eventos/${eventCode}`,
  artistas: '/artistas',
  artistaDetalle: (id: number | string) => `/artistas/${id}`,
  sedes: '/sedes',
  sedeDetalle: (code: string) => `/sedes/${code}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticketDetalle: (ticketCode: string) => `/mis-tickets/${ticketCode}`,
  compraConfirmacion: (ticketCode: string) => `/compra/confirmacion/${ticketCode}`,
  staffValidacion: '/staff/validacion',
  staffEventosTickets: (eventCode: string) => `/staff/eventos/${eventCode}/tickets`,
  adminEventos: '/admin/eventos',
  adminCrearEvento: '/admin/eventos/nuevo',
  adminGestionEvento: (eventCode: string) => `/admin/eventos/${eventCode}`,
  sinPermisos: '/403',
  noEncontrada: '/404',
} as const
