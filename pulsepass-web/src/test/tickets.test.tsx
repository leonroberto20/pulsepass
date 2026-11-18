import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MisTickets from '@/pages/MisTickets'
import DetalleTicket from '@/pages/DetalleTicket'
import ConfirmacionCompra from '@/pages/ConfirmacionCompra'
import * as useTicketsHooks from '@/funcionalidades/tickets/useTickets'

vi.mock('@/funcionalidades/tickets/useTickets')

describe('Flujo de Tickets y Mis Entradas (Etapa 8)', () => {
  let queryClient: QueryClient

  const mockTicket = {
    id: 1,
    ticketCode: 'TCK-2026-999',
    eventCode: 'CMF-2026',
    userEmail: 'andrea@example.com',
    type: 'VIP' as const,
    price: 180000,
    status: 'PAID' as const,
    purchaseDate: '2026-11-17T20:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('MisTickets: renderiza entradas del usuario y enlace a QR', () => {
    vi.spyOn(useTicketsHooks, 'useMisTickets').mockReturnValue({
      data: [mockTicket],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <MisTickets />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/#TCK-2026-999/i)).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver Pase Digital y QR/i })).toBeInTheDocument()
  })

  it('ConfirmacionCompra: muestra mensaje de éxito y resumen de orden', () => {
    vi.spyOn(useTicketsHooks, 'useTicket').mockReturnValue({
      data: mockTicket,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/compra/confirmacion/TCK-2026-999']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/compra/confirmacion/:ticketCode" element={<ConfirmacionCompra />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/¡Entrada Emitida con Éxito!/i)).toBeInTheDocument()
    expect(screen.getByText('TCK-2026-999')).toBeInTheDocument()
    expect(screen.getByText(/180\.000/i)).toBeInTheDocument()
  })

  it('DetalleTicket: renderiza pase digital con código QR simulado', () => {
    vi.spyOn(useTicketsHooks, 'useTicket').mockReturnValue({
      data: mockTicket,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(useTicketsHooks, 'useCancelarTicket').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <MemoryRouter initialEntries={['/mis-tickets/TCK-2026-999']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/mis-tickets/:ticketCode" element={<DetalleTicket />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/PulsePass Digital Pass/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código QR para el pase TCK-2026-999/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar Boleto/i })).toBeInTheDocument()
  })
})
