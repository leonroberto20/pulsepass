import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import {
  Menu,
  X,
  Sun,
  Moon,
  Ticket,
  User,
  LogOut,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  PlusCircle,
  QrCode,
} from 'lucide-react'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import { RUTAS } from '@/lib/rutas'
import { Badge } from '@/componentes'
import clsx from 'clsx'

export function Layout() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modoOscuro, setModoOscuro] = useState(() => {
    try {
      return (
        localStorage.getItem('pulsepass_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('pulsepass_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('pulsepass_theme', 'light')
    }
  }, [modoOscuro])

  function alternarTema() {
    setModoOscuro((prev) => !prev)
  }

  function handleCerrarSesion() {
    cerrarSesion()
    setMenuAbierto(false)
    navigate(RUTAS.inicio)
  }

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
      isActive
        ? 'text-marca-600 bg-marca-50 dark:bg-slate-800 dark:text-marca-400'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800',
    )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Barra de navegación superior */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo y Enlace Principal */}
          <div className="flex items-center gap-8">
            <Link
              to={RUTAS.inicio}
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-marca-600 dark:text-marca-500"
            >
              <Ticket className="h-6 w-6 rotate-12" />
              <span>PulsePass</span>
            </Link>

            {/* Enlaces de navegación desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to={RUTAS.eventos} className={claseEnlace}>
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </NavLink>
              <NavLink to={RUTAS.artistas} className={claseEnlace}>
                <Sparkles className="h-4 w-4" />
                <span>Artistas</span>
              </NavLink>
              <NavLink to={RUTAS.sedes} className={claseEnlace}>
                <MapPin className="h-4 w-4" />
                <span>Sedes</span>
              </NavLink>

              {/* Enlaces para USER */}
              {tieneRol('USER') && (
                <NavLink to={RUTAS.misTickets} className={claseEnlace}>
                  <Ticket className="h-4 w-4" />
                  <span>Mis Tickets</span>
                </NavLink>
              )}

              {/* Enlaces para STAFF */}
              {tieneRol('STAFF', 'ADMIN') && (
                <NavLink to={RUTAS.staffValidacion} className={claseEnlace}>
                  <QrCode className="h-4 w-4" />
                  <span>Validar Ingreso</span>
                </NavLink>
              )}

              {/* Enlaces para ADMIN */}
              {tieneRol('ADMIN') && (
                <NavLink to={RUTAS.adminEventos} className={claseEnlace}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Eventos</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* Acciones de usuario & Dark Mode Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={alternarTema}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {modoOscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {sesion.estado === 'autenticado' ? (
              <div className="flex items-center gap-3">
                <Link
                  to={RUTAS.cuenta}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{sesion.usuario.username}</span>
                  {sesion.usuario.roles.map((rol) => (
                    <Badge key={rol} tono={rol} className="text-[10px] py-0 px-1.5">
                      {rol}
                    </Badge>
                  ))}
                </Link>

                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={RUTAS.login}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to={RUTAS.registro}
                  className="rounded-lg bg-marca-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-marca-700 shadow-xs"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón hamburguesa móvil */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={alternarTema}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Alternar tema"
            >
              {modoOscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setMenuAbierto((prev) => !prev)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-expanded={menuAbierto}
              aria-label="Abrir menú de navegación"
            >
              {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil colapsable */}
        {menuAbierto && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
            <nav className="flex flex-col gap-1.5">
              <NavLink
                to={RUTAS.eventos}
                onClick={() => setMenuAbierto(false)}
                className={claseEnlace}
              >
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </NavLink>
              <NavLink
                to={RUTAS.artistas}
                onClick={() => setMenuAbierto(false)}
                className={claseEnlace}
              >
                <Sparkles className="h-4 w-4" />
                <span>Artistas</span>
              </NavLink>
              <NavLink
                to={RUTAS.sedes}
                onClick={() => setMenuAbierto(false)}
                className={claseEnlace}
              >
                <MapPin className="h-4 w-4" />
                <span>Sedes</span>
              </NavLink>

              {tieneRol('USER') && (
                <NavLink
                  to={RUTAS.misTickets}
                  onClick={() => setMenuAbierto(false)}
                  className={claseEnlace}
                >
                  <Ticket className="h-4 w-4" />
                  <span>Mis Tickets</span>
                </NavLink>
              )}

              {tieneRol('STAFF', 'ADMIN') && (
                <NavLink
                  to={RUTAS.staffValidacion}
                  onClick={() => setMenuAbierto(false)}
                  className={claseEnlace}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Validar Ingreso</span>
                </NavLink>
              )}

              {tieneRol('ADMIN') && (
                <>
                  <NavLink
                    to={RUTAS.adminEventos}
                    onClick={() => setMenuAbierto(false)}
                    className={claseEnlace}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Eventos</span>
                  </NavLink>
                  <NavLink
                    to={RUTAS.adminCrearEvento}
                    onClick={() => setMenuAbierto(false)}
                    className={claseEnlace}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Crear Evento</span>
                  </NavLink>
                </>
              )}

              <hr className="my-2 border-slate-200 dark:border-slate-800" />

              {sesion.estado === 'autenticado' ? (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>Usuario: {sesion.usuario.username}</span>
                    <div className="flex gap-1">
                      {sesion.usuario.roles.map((r) => (
                        <Badge key={r} tono={r}>
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <NavLink
                    to={RUTAS.cuenta}
                    onClick={() => setMenuAbierto(false)}
                    className={claseEnlace}
                  >
                    <User className="h-4 w-4" />
                    <span>Mi Cuenta</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleCerrarSesion}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to={RUTAS.login}
                    onClick={() => setMenuAbierto(false)}
                    className="w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to={RUTAS.registro}
                    onClick={() => setMenuAbierto(false)}
                    className="w-full rounded-lg bg-marca-600 py-2 text-center text-sm font-medium text-white hover:bg-marca-700"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pie de página */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Ticket className="h-4 w-4 text-marca-600" />
            <span>PulsePass Web • Fase 5</span>
          </div>
          <p>© 2026 PulsePass. Caso de estudio académico — Plataforma de Eventos y Entradas.</p>
          <div className="flex gap-4">
            <Link to={RUTAS.eventos} className="hover:underline">Eventos</Link>
            <Link to={RUTAS.artistas} className="hover:underline">Artistas</Link>
            <Link to={RUTAS.sedes} className="hover:underline">Sedes</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
