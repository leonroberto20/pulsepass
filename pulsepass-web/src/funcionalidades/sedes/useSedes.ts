import { useQuery } from '@tanstack/react-query'
import { sedesServicio } from './servicio'

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: () => sedesServicio.listarActivas(),
  })
}

export function useSede(code: string | undefined) {
  return useQuery({
    queryKey: ['sedes', 'detalle', code],
    queryFn: () => {
      if (!code) throw new Error('Código de sede no especificado')
      return sedesServicio.obtenerPorCodigo(code)
    },
    enabled: Boolean(code),
  })
}
