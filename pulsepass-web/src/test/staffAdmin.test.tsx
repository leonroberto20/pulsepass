import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ValidacionIngreso from '@/pages/ValidacionIngreso'
import TicketsPagadosEvento from '@/pages/TicketsPagadosEvento'
import AdminEventos from '@/pages/AdminEventos'
import AdminCrearEvento from '@/pages/AdminCrearEvento'
import AdminGestionEvento from '@/pages/AdminGestionEvento'
import { ticketsServicio } from '@/funcionalidades/tickets/servicio'
import * as useTicketsHooks from '@/funcionalidades/tickets/useTickets'
import * as useEventosHooks from '@/funcionalidades/eventos/useEventos'
import * as useSedesHooks from '@/funcionalidades/sedes/useSedes'
import * as useArtistasHooks from '@/funcionalidades/artistas/useArtistas'

vi.mock('@/funcionalidades/tickets/servicio')
vi.mock('@/funcionalidades/tickets/useTickets')
vi.mock('@/funcionalidades/eventos/useEventos')
vi.mock('@/funcionalidades/sedes/useSedes')
vi.mock('@/funcionalidades/artistas/useArtistas')

describe('Etapa 9: Portal de Personal Operativo (Staff)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('ValidacionIngreso: busca ticket y muestra estado para ingreso', async () => {
    const mockTicket = {
      id: 1,
      ticketCode: 'TCK-VALID-100',
      eventCode: 'CMF-2026',
      userEmail: 'asistente@test.com',
      type: 'GENERAL' as const,
      price: 85000,
      status: 'PAID' as const,
      purchaseDate: '2026-11-17T10:00:00Z',
    }

    vi.spyOn(ticketsServicio, 'obtenerPorCodigo').mockResolvedValue(mockTicket)
    vi.spyOn(useTicketsHooks, 'useMarcarTicketUsado').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ValidacionIngreso />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    const input = screen.getByLabelText(/Código del Ticket/i)
    fireEvent.change(input, { target: { value: 'TCK-VALID-100' } })

    const btnConsultar = screen.getByRole('button', { name: /Consultar Entrada/i })
    fireEvent.click(btnConsultar)

    await waitFor(() => {
      expect(screen.getByText(/BOLETO VÁLIDO PARA INGRESO/i)).toBeInTheDocument()
      expect(screen.getByText('asistente@test.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Validar Entrada/i })).toBeInTheDocument()
    })
  })

  it('TicketsPagadosEvento: lista asistentes y permite validar en puerta', () => {
    vi.spyOn(useEventosHooks, 'useEvento').mockReturnValue({
      data: {
        id: 1,
        eventCode: 'CMF-2026',
        name: 'Caribbean Fest 2026',
      },
      isLoading: false,
    } as any)

    vi.spyOn(useTicketsHooks, 'useTicketsPagadosPorEvento').mockReturnValue({
      data: [
        {
          id: 1,
          ticketCode: 'TCK-PAGADO-1',
          eventCode: 'CMF-2026',
          userEmail: 'user1@test.com',
          type: 'VIP',
          price: 180000,
          status: 'PAID',
          purchaseDate: '2026-11-17T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(useTicketsHooks, 'useMarcarTicketUsado').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <MemoryRouter initialEntries={['/staff/eventos/CMF-2026/tickets']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/staff/eventos/:eventCode/tickets" element={<TicketsPagadosEvento />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('TCK-PAGADO-1')).toBeInTheDocument()
    expect(screen.getByText('user1@test.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Validar/i })).toBeInTheDocument()
  })
})

describe('Etapa 10: Portal de Administración (Admin)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('AdminEventos: lista eventos con botón a crear y gestionar', () => {
    vi.spyOn(useEventosHooks, 'useEventosPublicados').mockReturnValue({
      data: [
        {
          id: 1,
          eventCode: 'TECH-2026',
          name: 'Tech Summit 2026',
          category: 'TECHNOLOGY',
          status: 'PUBLISHED',
          eventDate: '2026-12-01T10:00:00Z',
          venueName: 'Arena Norte',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AdminEventos />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Gestión de Eventos/i })).toBeInTheDocument()
    expect(screen.getByText('Tech Summit 2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Crear Nuevo Evento/i })).toBeInTheDocument()
  })

  it('AdminCrearEvento: carga sedes para selección', () => {
    vi.spyOn(useSedesHooks, 'useSedesActivas').mockReturnValue({
      data: [
        {
          id: 1,
          code: 'VEN-01',
          name: 'Palacio de los Deportes',
          city: 'Bogotá',
          address: 'Calle 63',
          capacity: 5000,
          active: true,
        },
      ],
      isLoading: false,
    } as any)

    vi.spyOn(useEventosHooks, 'useCrearEvento').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AdminCrearEvento />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Nuevo Evento/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Código Único del Evento/i)).toBeInTheDocument()
    expect(screen.getByText(/Palacio de los Deportes/i)).toBeInTheDocument()
  })

  it('AdminGestionEvento: permite publicar evento en borrador y vincular artista', () => {
    vi.spyOn(useEventosHooks, 'useEvento').mockReturnValue({
      data: {
        id: 1,
        eventCode: 'DRAFT-EVT',
        name: 'Concierto en Preparación',
        category: 'MUSIC',
        status: 'DRAFT',
        eventDate: '2026-12-15T20:00:00Z',
        minimumAge: 18,
        venueCode: 'VEN-01',
        venueName: 'Palacio de los Deportes',
        artists: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(useArtistasHooks, 'useArtistasActivos').mockReturnValue({
      data: [
        {
          id: 5,
          stageName: 'Banda Invitada',
          genre: 'Rock',
          country: 'Colombia',
          active: true,
        },
      ],
      isLoading: false,
    } as any)

    vi.spyOn(useEventosHooks, 'usePublicarEvento').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.spyOn(useEventosHooks, 'useAgregarArtistaAEvento').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <MemoryRouter initialEntries={['/admin/eventos/DRAFT-EVT/gestion']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/admin/eventos/:eventCode/gestion" element={<AdminGestionEvento />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Concierto en Preparación')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Publicar Evento/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vincular Artista/i })).toBeInTheDocument()
  })
})
