import { useState, type FormEvent } from 'react'
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Calendar,
  Ticket as TicketIcon,
} from 'lucide-react'
import { ticketsServicio } from '@/funcionalidades/tickets/servicio'
import { useMarcarTicketUsado } from '@/funcionalidades/tickets/useTickets'
import type { TicketResponse } from '@/funcionalidades/tickets/tipos'
import {
  Tarjeta,
  Badge,
  Boton,
  Campo,
  Aviso,
} from '@/componentes'
import { formatearFechaHora, formatearCOP } from '@/lib/formato'
import { ApiError } from '@/lib/http'

export default function ValidacionIngreso() {
  const [codigoBuscado, setCodigoBuscado] = useState('')
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false)
  const [ticketEncontrado, setTicketEncontrado] = useState<TicketResponse | null>(null)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const marcarUsadoMutation = useMarcarTicketUsado()

  async function handleBuscar(e: FormEvent) {
    e.preventDefault()
    const codigo = codigoBuscado.trim()
    if (!codigo) return

    setCargandoBusqueda(true)
    setErrorBusqueda(null)
    setMensajeExito(null)
    setTicketEncontrado(null)

    try {
      const ticket = await ticketsServicio.obtenerPorCodigo(codigo)
      setTicketEncontrado(ticket)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setErrorBusqueda(`El ticket con código "${codigo}" no existe en el sistema.`)
        } else if (err.status === 403) {
          setErrorBusqueda('No tienes permisos para consultar tickets de otros usuarios o eventos.')
        } else {
          setErrorBusqueda(err.message || 'Error al consultar el ticket.')
        }
      } else {
        setErrorBusqueda('No se pudo establecer conexión con el servidor.')
      }
    } finally {
      setCargandoBusqueda(false)
    }
  }

  async function handleValidarIngreso() {
    if (!ticketEncontrado) return
    setErrorBusqueda(null)
    setMensajeExito(null)

    try {
      const ticketActualizado = await marcarUsadoMutation.mutateAsync(ticketEncontrado.ticketCode)
      setTicketEncontrado(ticketActualizado)
      setMensajeExito(`¡Acceso CONCEDIDO! El ticket ${ticketActualizado.ticketCode} fue marcado como USADO.`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorBusqueda(err.message || 'Error al validar el ingreso.')
      } else {
        setErrorBusqueda('No se pudo conectar con el servidor para registrar el ingreso.')
      }
    }
  }

  function handleLimpiar() {
    setCodigoBuscado('')
    setTicketEncontrado(null)
    setErrorBusqueda(null)
    setMensajeExito(null)
  }

  const esValido = ticketEncontrado?.status === 'PAID'
  const esYaUsado = ticketEncontrado?.status === 'USED'
  const esCancelado = ticketEncontrado?.status === 'CANCELLED'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Control de Accesos • Puerta y Torniquetes
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Validación de Ingreso
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Ingresa o escanea el código alfanumérico del pase digital para verificar su validez y registrar la entrada.
        </p>
      </div>

      {/* Buscador / Escáner */}
      <form onSubmit={handleBuscar} className="mt-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Campo
                etiqueta="Código del Ticket (Pase Digital)"
                placeholder="Ej. TCK-9A8B7C6D-2026..."
                value={codigoBuscado}
                onChange={(e) => setCodigoBuscado(e.target.value.toUpperCase())}
                autoFocus
                required
              />
            </div>
            <Boton
              type="submit"
              variante="primario"
              cargando={cargandoBusqueda}
              disabled={!codigoBuscado.trim()}
              icono={<Search className="h-4 w-4" />}
            >
              Consultar Entrada
            </Boton>
            {ticketEncontrado && (
              <Boton
                type="button"
                variante="secundario"
                onClick={handleLimpiar}
              >
                Limpiar
              </Boton>
            )}
          </div>
        </div>
      </form>

      {/* Alertas */}
      {errorBusqueda && (
        <div className="mt-6">
          <Aviso tipo="error" titulo="Atención de Control de Acceso" onCerrar={() => setErrorBusqueda(null)}>
            {errorBusqueda}
          </Aviso>
        </div>
      )}

      {mensajeExito && (
        <div className="mt-6">
          <Aviso tipo="exito" titulo="Ingreso Confirmado" onCerrar={() => setMensajeExito(null)}>
            {mensajeExito}
          </Aviso>
        </div>
      )}

      {/* Resultado del Ticket */}
      {ticketEncontrado && (
        <div className="mt-8">
          <Tarjeta
            className={`border-2 transition-all shadow-lg ${
              esValido
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                : esYaUsado
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                : 'border-red-500 bg-red-50/20 dark:bg-red-950/10'
            }`}
          >
            {/* Banner de Estado Operativo */}
            <div
              className={`-mx-6 -mt-6 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b ${
                esValido
                  ? 'bg-emerald-600 text-white'
                  : esYaUsado
                  ? 'bg-amber-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {esValido && <CheckCircle2 className="h-8 w-8" />}
                {esYaUsado && <AlertTriangle className="h-8 w-8" />}
                {esCancelado && <XCircle className="h-8 w-8" />}
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {esValido && 'BOLETO VÁLIDO PARA INGRESO'}
                    {esYaUsado && 'BOLETO YA FUE USADO PREVIAMENTE'}
                    {esCancelado && 'BOLETO CANCELADO - NO PERMITIR ENTRADA'}
                  </h3>
                  <p className="text-xs opacity-90">
                    {esValido && 'El titular puede ingresar al recinto. Presiona Validar Entrada para marcarlo.'}
                    {esYaUsado && 'Este pase ya registró un ingreso anteriormente.'}
                    {esCancelado && 'Esta compra fue anulada en el sistema.'}
                  </p>
                </div>
              </div>

              <span className="font-mono text-sm px-3 py-1 bg-black/20 rounded-full font-bold">
                {ticketEncontrado.ticketCode}
              </span>
            </div>

            {/* Ficha de Información del Asistente */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Evento</span>
                <p className="mt-1 font-mono font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TicketIcon className="h-4 w-4 text-slate-400" />
                  {ticketEncontrado.eventCode}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Localidad / Tipo</span>
                <div className="mt-1">
                  <Badge tono={ticketEncontrado.type} className="text-sm px-2.5 py-1">
                    {ticketEncontrado.type}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Estado</span>
                <div className="mt-1">
                  <Badge tono={ticketEncontrado.status} className="text-sm px-2.5 py-1">
                    {ticketEncontrado.status}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Titular</span>
                <p className="mt-1 font-medium text-slate-900 dark:text-white truncate">
                  {ticketEncontrado.userEmail}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Fecha de Compra</span>
                <p className="mt-1 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatearFechaHora(ticketEncontrado.purchaseDate)}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Precio Pagado</span>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">
                  {formatearCOP(ticketEncontrado.price)}
                </p>
              </div>
            </div>

            {/* Acción de Entrada */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <QrCode className="h-4 w-4" />
                <span>Pase verificado mediante API Spring Security (Rol STAFF / ADMIN)</span>
              </div>

              {esValido && (
                <Boton
                  variante="primario"
                  className="w-full sm:w-auto py-3 px-8 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md"
                  onClick={handleValidarIngreso}
                  cargando={marcarUsadoMutation.isPending}
                  icono={<UserCheck className="h-5 w-5" />}
                >
                  Validar Entrada (Permitir Ingreso)
                </Boton>
              )}
            </div>
          </Tarjeta>
        </div>
      )}
    </div>
  )
}
