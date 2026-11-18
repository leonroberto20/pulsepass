import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus, ArrowLeft, Building2 } from 'lucide-react'
import { CreateEventRequestSchema, type CreateEventRequest } from '@/funcionalidades/eventos/esquemas'
import { useCrearEvento } from '@/funcionalidades/eventos/useEventos'
import { useSedesActivas } from '@/funcionalidades/sedes/useSedes'
import {
  Tarjeta,
  Boton,
  Campo,
  Selector,
  Aviso,
} from '@/componentes'
import { RUTAS } from '@/lib/rutas'
import { ApiError } from '@/lib/http'

const CATEGORIAS_FORM = [
  { valor: 'MUSIC', etiqueta: 'Música' },
  { valor: 'SPORTS', etiqueta: 'Deportes' },
  { valor: 'TECHNOLOGY', etiqueta: 'Tecnología' },
  { valor: 'EDUCATION', etiqueta: 'Educación' },
  { valor: 'CULTURE', etiqueta: 'Cultura' },
  { valor: 'ENTERTAINMENT', etiqueta: 'Entretenimiento' },
]

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const { data: sedes, isLoading: cargandoSedes } = useSedesActivas()
  const crearEventoMutation = useCrearEvento()

  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventRequest>({
    resolver: zodResolver(CreateEventRequestSchema) as any,
    defaultValues: {
      category: 'MUSIC',
      minimumAge: 18,
    },
  })

  const opcionesSedes = [
    { valor: '', etiqueta: cargandoSedes ? 'Cargando sedes...' : 'Selecciona una sede...' },
    ...(sedes || []).map((s) => ({
      valor: s.code,
      etiqueta: `${s.name} (${s.city} - Capacidad: ${s.capacity})`,
    })),
  ]

  async function onSubmit(datos: CreateEventRequest) {
    setErrorServidor(null)
    try {
      // Normalizar fecha si viene de datetime-local
      const fechaIso = new Date(datos.eventDate).toISOString()
      const eventoCreado = await crearEventoMutation.mutateAsync({
        ...datos,
        eventDate: fechaIso,
      })

      // Redirigir a la pantalla de gestión del nuevo evento
      navigate(RUTAS.adminEventoGestion(eventoCreado.eventCode))
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          Object.entries(err.details).forEach(([campo, mensaje]) => {
            setError(campo as keyof CreateEventRequest, { message: mensaje })
          })
        }
        setErrorServidor(err.message || 'Error al crear el evento.')
      } else {
        setErrorServidor('No se pudo establecer conexión con el servidor.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Botón Volver */}
      <div className="mb-6">
        <Link to={RUTAS.adminEventos}>
          <Boton variante="fantasma" icono={<ArrowLeft className="h-4 w-4" />}>
            Volver a la lista de eventos
          </Boton>
        </Link>
      </div>

      {/* Cabecera */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Crear Nuevo Evento
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Registra un nuevo espectáculo en estado borrador (DRAFT) para programar cartelera y recintos.
        </p>
      </div>

      {errorServidor && (
        <div className="mt-6">
          <Aviso tipo="error" titulo="Error en la creación" onCerrar={() => setErrorServidor(null)}>
            {errorServidor}
          </Aviso>
        </div>
      )}

      {/* Formulario */}
      <Tarjeta className="mt-8 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Campo
              etiqueta="Código Único del Evento"
              placeholder="Ej. FEST-SMR-2026"
              ayuda="Alfanumérico único para el evento."
              error={errors.eventCode?.message}
              required
              {...register('eventCode')}
            />

            <Selector
              etiqueta="Categoría del Espectáculo"
              opciones={CATEGORIAS_FORM}
              error={errors.category?.message}
              required
              {...register('category')}
            />
          </div>

          <Campo
            etiqueta="Nombre del Evento"
            placeholder="Ej. Caribbean Summer Sound 2026"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción del Evento
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre el festival, experiencias, recomendaciones de ingreso..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-purple-600"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Campo
              etiqueta="Fecha y Hora de Inicio"
              type="datetime-local"
              error={errors.eventDate?.message}
              required
              {...register('eventDate')}
            />

            <Campo
              etiqueta="Edad Mínima Requerida"
              type="number"
              min={0}
              placeholder="18"
              ayuda="0 para evento familiar / todo público."
              error={errors.minimumAge?.message}
              required
              {...register('minimumAge')}
            />
          </div>

          <div>
            <Selector
              etiqueta="Sede / Recinto Anfitrión"
              opciones={opcionesSedes}
              error={errors.venueCode?.message}
              required
              {...register('venueCode')}
            />
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              La sede determina la capacidad y aforo para la emisión de tickets.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Link to={RUTAS.adminEventos}>
              <Boton variante="secundario" type="button">
                Cancelar
              </Boton>
            </Link>
            <Boton
              variante="primario"
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              cargando={isSubmitting || crearEventoMutation.isPending}
            >
              Registrar Evento
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
