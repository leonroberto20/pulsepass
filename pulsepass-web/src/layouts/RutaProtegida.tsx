import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import { RUTAS } from '@/lib/rutas'
import { Cargando } from '@/componentes'

export function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando mensaje="Comprobando sesión..." />
  }

  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />
  }

  return <Outlet />
}
