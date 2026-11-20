import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { User, Mail, Calendar, MapPin, Phone, Shield, Ticket, LogOut } from 'lucide-react'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import { usuariosServicio } from '@/funcionalidades/usuarios/servicio'
import { Tarjeta, Badge, Boton, Cargando, EstadoError } from '@/componentes'
import { formatearFecha } from '@/lib/formato'
import { RUTAS } from '@/lib/rutas'

export default function Cuenta() {
  const { sesion, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const username = sesion.estado === 'autenticado' ? sesion.usuario.username : ''

  const {
    data: usuarioPerfil,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['usuarioPerfil', username],
    queryFn: () => usuariosServicio.obtenerPorUsername(username),
    enabled: Boolean(username),
  })

  if (sesion.estado !== 'autenticado') {
    return null
  }

  function handleCerrarSesion() {
    cerrarSesion()
    navigate(RUTAS.inicio)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Detalles de tu cuenta de usuario, credenciales y roles asignados en PulsePass.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={RUTAS.misTickets}>
            <Boton variante="secundario" icono={<Ticket className="h-4 w-4" />}>
              Mis Entradas
            </Boton>
          </Link>
          <Boton
            variante="fantasma"
            onClick={handleCerrarSesion}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            icono={<LogOut className="h-4 w-4" />}
          >
            Cerrar sesión
          </Boton>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Cargando mensaje="Cargando información del perfil..." />
        </div>
      ) : isError ? (
        <div className="py-8">
          <EstadoError
            titulo="No se pudo cargar el perfil completo"
            mensaje={(error as Error)?.message || 'Ocurrió un problema al obtener los datos de usuario.'}
            onReintentar={() => refetch()}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Resumen / Avatar */}
          <Tarjeta className="md:col-span-1 flex flex-col items-center text-center p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-marca-100 text-marca-700 dark:bg-slate-800 dark:text-marca-400 text-3xl font-extrabold shadow-inner">
              {sesion.usuario.username.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              {usuarioPerfil?.firstName && usuarioPerfil?.lastName
                ? `${usuarioPerfil.firstName} ${usuarioPerfil.lastName}`
                : sesion.usuario.username}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{sesion.usuario.username}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {sesion.usuario.roles.map((rol) => (
                <Badge key={rol} tono={rol}>
                  {rol}
                </Badge>
              ))}
            </div>

            <div className="mt-6 w-full border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 text-left space-y-2">
              <div className="flex justify-between">
                <span>Estado de cuenta:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {usuarioPerfil?.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ID de Usuario:</span>
                <span className="font-mono">#{sesion.usuario.id}</span>
              </div>
            </div>
          </Tarjeta>

          {/* Información Detallada */}
          <Tarjeta className="md:col-span-2 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Datos Personales
            </h3>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Correo electrónico
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {sesion.usuario.email}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nombre completo
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {usuarioPerfil?.firstName} {usuarioPerfil?.lastName}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fecha de nacimiento
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {usuarioPerfil?.birthDate
                      ? formatearFecha(usuarioPerfil.birthDate)
                      : 'No registrada'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ciudad
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {usuarioPerfil?.city || 'No registrada'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Teléfono
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {usuarioPerfil?.phone || 'No registrado'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sesión actual
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    Autenticada con JWT
                  </dd>
                </div>
              </div>
            </dl>
          </Tarjeta>
        </div>
      )}
    </div>
  )
}
