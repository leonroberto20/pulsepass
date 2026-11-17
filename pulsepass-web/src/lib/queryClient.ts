import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar ante errores de cliente controlados (PRD §14.3)
        if (error instanceof ApiError) {
          if ([400, 401, 403, 404, 409].includes(error.status)) {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export function limpiarCache() {
  queryClient.clear()
}
