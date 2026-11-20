import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { MapPin, Users, Building, ArrowRight, FilterX } from 'lucide-react'
import { useSedesActivas } from '@/funcionalidades/sedes/useSedes'
import {
  Tarjeta,
  Badge,
  Boton,
  Campo,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function ListaSedes() {
  const { data: sedes, isLoading, isError, error, refetch } = useSedesActivas()
  const [busqueda, setBusqueda] = useState('')

  const sedesFiltradas = useMemo(() => {
    if (!sedes) return []
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return sedes

    return sedes.filter(
      (sede) =>
        sede.name.toLowerCase().includes(termino) ||
        sede.city.toLowerCase().includes(termino) ||
        sede.code.toLowerCase().includes(termino) ||
        (sede.address && sede.address.toLowerCase().includes(termino)),
    )
  }, [sedes, busqueda])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Escenarios y Recintos
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Sedes de Eventos
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Conoce los centros de convenciones, estadios y auditorios donde se realizan los eventos.
          </p>
        </div>

        {sedes && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Mostrando <span className="font-bold text-slate-900 dark:text-white">{sedesFiltradas.length}</span> de {sedes.length} recintos
          </p>
        )}
      </div>

      {/* Buscador */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex-1">
          <Campo
            etiqueta="Buscar sede o ciudad"
            placeholder="Nombre, código o ciudad (ej. Marina Convention, Santa Marta, VEN-SMR-01)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 pb-0.5"
          >
            <FilterX className="h-4 w-4" />
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-16">
            <Cargando mensaje="Cargando sedes y recintos..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <EstadoError
              titulo="No pudimos cargar la lista de sedes"
              mensaje={(error as Error)?.message || 'Ocurrió un error al consultar las sedes.'}
              onReintentar={() => refetch()}
            />
          </div>
        ) : sedesFiltradas.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron sedes"
            mensaje="No hay recintos que coincidan con el término de búsqueda ingresado."
            accion={
              busqueda && (
                <Boton variante="secundario" onClick={() => setBusqueda('')}>
                  Ver todas las sedes
                </Boton>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sedesFiltradas.map((sede) => (
              <Tarjeta
                key={sede.code}
                className="flex flex-col justify-between hover:border-rose-500 hover:shadow-md transition group p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-md">
                      {sede.code}
                    </span>
                    <Badge tono={sede.active ? 'exito' : 'error'}>
                      {sede.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 transition-colors">
                    {sede.name}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{sede.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{sede.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        Aforo: <strong>{sede.capacity.toLocaleString('es-CO')} personas</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link to={RUTAS.sedeDetalle(sede.code)}>
                    <Boton
                      variante="secundario"
                      className="w-full text-xs py-1.5 justify-center group-hover:bg-rose-50 group-hover:text-rose-700 dark:group-hover:bg-slate-800 dark:group-hover:text-rose-300"
                      icono={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Ver Detalle y Ubicación
                    </Boton>
                  </Link>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
