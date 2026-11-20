import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import { LogIn, ArrowRight } from 'lucide-react'
import { useAuth } from '@/funcionalidades/auth/useAuth'
import { LoginRequestSchema, type LoginRequest } from '@/funcionalidades/auth/esquemas'
import { Campo, Boton, Aviso, Tarjeta } from '@/componentes'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const rutaDestino = (location.state as { desde?: string } | null)?.desde || RUTAS.inicio
  const mensajeRegistroExitoso = (location.state as { mensajeRegistro?: string } | null)?.mensajeRegistro

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginRequest) {
    setErrorServidor(null)
    try {
      await iniciarSesion(data)
      navigate(rutaDestino, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setErrorServidor('Credenciales incorrectas. Verifica tu usuario/correo y contraseña.')
        } else {
          setErrorServidor(err.message || 'Error al iniciar sesión.')
        }
      } else {
        setErrorServidor('No se pudo establecer conexión con el servidor.')
      }
    }
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-400">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Accede a tu cuenta de PulsePass para comprar y gestionar tus tickets
          </p>
        </div>

        <Tarjeta className="mt-8 shadow-lg">
          {mensajeRegistroExitoso && (
            <div className="mb-6">
              <Aviso tipo="exito" titulo="¡Registro exitoso!">
                {mensajeRegistroExitoso}
              </Aviso>
            </div>
          )}

          {location.state?.desde && !mensajeRegistroExitoso && (
            <div className="mb-6">
              <Aviso tipo="info" titulo="Autenticación requerida">
                Debes iniciar sesión para acceder al contenido solicitado.
              </Aviso>
            </div>
          )}

          {errorServidor && (
            <div className="mb-6">
              <Aviso tipo="error" titulo="Error de acceso" onCerrar={() => setErrorServidor(null)}>
                {errorServidor}
              </Aviso>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Campo
              etiqueta="Usuario o correo electrónico"
              type="text"
              placeholder="andrea o andrea@example.com"
              autoComplete="username"
              error={errors.identifier?.message}
              required
              {...register('identifier')}
            />

            <Campo
              etiqueta="Contraseña"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="pt-2">
              <Boton
                type="submit"
                variante="primario"
                cargando={isSubmitting}
                className="w-full py-2.5 font-semibold text-base shadow-sm"
                icono={<ArrowRight className="h-4 w-4" />}
              >
                Ingresar a PulsePass
              </Boton>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿No tienes una cuenta aún?{' '}
              <Link
                to={RUTAS.registro}
                className="font-semibold text-marca-600 hover:text-marca-700 hover:underline dark:text-marca-400"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Tarjeta>
      </div>
    </div>
  )
}
