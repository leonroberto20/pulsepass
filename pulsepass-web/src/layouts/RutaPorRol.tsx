import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import type { Rol } from '@/lib/esquemasComunes'
import { RUTAS } from '@/lib/rutas'
import { Cargando } from '@/componentes'

export interface RutaPorRolProps {
  roles: Rol[]
}

export function RutaPorRol({ roles }: { roles: Rol[] }) {
  const { sesion, tieneRol } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando mensaje="Comprobando permisos..." />
  }

  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />
  }

  if (!tieneRol(...roles)) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return <Outlet />
}
