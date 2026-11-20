import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { UserPlus, ArrowRight } from 'lucide-react'
import { usuariosServicio } from '@/funcionalidades/usuarios/servicio'
import {
  RegisterUserRequestSchema,
  type RegisterUserRequest,
} from '@/funcionalidades/usuarios/esquemas'
import { Campo, Boton, Aviso, Tarjeta } from '@/componentes'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

export default function Registro() {
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserRequest>({
    resolver: zodResolver(RegisterUserRequestSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      birthDate: '',
    },
  })

  async function onSubmit(data: RegisterUserRequest) {
    setErrorServidor(null)
    try {
      await usuariosServicio.registrar(data)
      navigate(RUTAS.login, {
        replace: true,
        state: {
          mensajeRegistro:
            '¡Tu cuenta ha sido creada exitosamente! Por favor ingresa con tu usuario/correo y contraseña.',
        },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Object.keys(err.details).length > 0) {
          // Asignar errores específicos de campos devueltos por Spring Boot
          Object.entries(err.details).forEach(([campo, mensaje]) => {
            setError(campo as keyof RegisterUserRequest, { message: mensaje })
          })
          setErrorServidor('Por favor corrige los errores señalados en el formulario.')
        } else {
          setErrorServidor(err.message || 'Error al procesar el registro de usuario.')
        }
      } else {
        setErrorServidor('No se pudo conectar con el servidor.')
      }
    }
  }

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Crear cuenta en PulsePass
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Completa tus datos para comprar entradas y vivir la mejor música y eventos
          </p>
        </div>

        <Tarjeta className="mt-8 shadow-lg">
          {errorServidor && (
            <div className="mb-6">
              <Aviso tipo="error" titulo="Error de registro" onCerrar={() => setErrorServidor(null)}>
                {errorServidor}
              </Aviso>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo
                etiqueta="Nombre"
                placeholder="Andrea"
                error={errors.firstName?.message}
                required
                {...register('firstName')}
              />
              <Campo
                etiqueta="Apellido"
                placeholder="Gómez"
                error={errors.lastName?.message}
                required
                {...register('lastName')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo
                etiqueta="Nombre de usuario"
                placeholder="andreag"
                autoComplete="username"
                error={errors.username?.message}
                required
                {...register('username')}
              />
              <Campo
                etiqueta="Correo electrónico"
                type="email"
                placeholder="andrea@example.com"
                autoComplete="email"
                error={errors.email?.message}
                required
                {...register('email')}
              />
            </div>

            <Campo
              etiqueta="Contraseña"
              type="password"
              placeholder="Mínimo 12 caracteres (máx. 72)"
              autoComplete="new-password"
              ayuda="La contraseña debe tener entre 12 y 72 caracteres de acuerdo con la política de seguridad."
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo
                etiqueta="Fecha de nacimiento"
                type="date"
                error={errors.birthDate?.message}
                required
                {...register('birthDate')}
              />
              <Campo
                etiqueta="Ciudad de residencia"
                placeholder="Santa Marta"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            <Campo
              etiqueta="Teléfono"
              type="tel"
              placeholder="+57 300 123 4567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="pt-4">
              <Boton
                type="submit"
                variante="primario"
                cargando={isSubmitting}
                className="w-full py-2.5 font-semibold text-base shadow-sm"
                icono={<ArrowRight className="h-4 w-4" />}
              >
                Crear mi cuenta
              </Boton>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link
                to={RUTAS.login}
                className="font-semibold text-marca-600 hover:text-marca-700 hover:underline dark:text-marca-400"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Tarjeta>
      </div>
    </div>
  )
}
