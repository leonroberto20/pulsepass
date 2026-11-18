import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { Sparkles, Globe, Music, ArrowRight, FilterX } from 'lucide-react'
import { useArtistasActivos } from '@/funcionalidades/artistas/useArtistas'
import {
  Tarjeta,
  Boton,
  Campo,
  Cargando,
  EstadoVacio,
  EstadoError,
} from '@/componentes'
import { RUTAS } from '@/lib/rutas'

export default function ListaArtistas() {
  const { data: artistas, isLoading, isError, error, refetch } = useArtistasActivos()
  const [busqueda, setBusqueda] = useState('')

  const artistasFiltrados = useMemo(() => {
    if (!artistas) return []
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return artistas

    return artistas.filter(
      (art) =>
        art.stageName.toLowerCase().includes(termino) ||
        (art.genre && art.genre.toLowerCase().includes(termino)) ||
        (art.country && art.country.toLowerCase().includes(termino)),
    )
  }, [artistas, busqueda])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Talento en Vivo
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Artistas y Agrupaciones
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Descubre a los artistas que encabezan los festivales y conciertos en PulsePass.
          </p>
        </div>

        {artistas && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Mostrando <span className="font-bold text-slate-900 dark:text-white">{artistasFiltrados.length}</span> de {artistas.length} artistas
          </p>
        )}
      </div>

      {/* Buscador */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex-1">
          <Campo
            etiqueta="Buscar artista"
            placeholder="Nombre artístico, género o país (ej. Solar Beat, Electronic, Colombia)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 pb-0.5"
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
            <Cargando mensaje="Cargando directorio de artistas..." />
          </div>
        ) : isError ? (
          <div className="py-8">
            <EstadoError
              titulo="No pudimos cargar la lista de artistas"
              mensaje={(error as Error)?.message || 'Ocurrió un error al consultar los artistas.'}
              onReintentar={() => refetch()}
            />
          </div>
        ) : artistasFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron artistas"
            mensaje="No hay artistas que coincidan con el término de búsqueda ingresado."
            accion={
              busqueda && (
                <Boton variante="secundario" onClick={() => setBusqueda('')}>
                  Ver todos los artistas
                </Boton>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artistasFiltrados.map((artista) => (
              <Tarjeta
                key={artista.id}
                className="flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition group p-5"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-slate-800 dark:text-purple-400">
                    <Sparkles className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors">
                    {artista.stageName}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{artista.genre || 'Género no especificado'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{artista.country || 'Internacional'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link to={RUTAS.artistaDetalle(artista.id)}>
                    <Boton
                      variante="secundario"
                      className="w-full text-xs py-1.5 justify-center group-hover:bg-purple-50 group-hover:text-purple-700 dark:group-hover:bg-slate-800 dark:group-hover:text-purple-300"
                      icono={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Ver Perfil y Eventos
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
