import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import { RUTAS } from '@/lib/rutas'
import { Cargando } from '@/componentes'

export function SoloAnonimo() {
  const { sesion } = useAuth()

  if (sesion.estado === 'cargando') {
    return <Cargando mensaje="Cargando..." />
  }

  if (sesion.estado === 'autenticado') {
    return <Navigate to={RUTAS.inicio} replace />
  }

  return <Outlet />
}
