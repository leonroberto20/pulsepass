import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CatalogoEventos from '@/pages/CatalogoEventos'
import DetalleEvento from '@/pages/DetalleEvento'
import * as useEventosHooks from '@/funcionalidades/eventos/useEventos'
import type { EventSummaryResponse, EventResponse } from '@/funcionalidades/eventos/tipos'

vi.mock('@/funcionalidades/eventos/useEventos')

// Mock de useAuth
vi.mock('@/funcionalidades/auth/useAuth', () => ({
  useAuth: () => ({
    sesion: { estado: 'anonimo' },
    tieneRol: vi.fn(() => false),
  }),
}))

const MOCK_EVENTOS: EventSummaryResponse[] = [
  {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-11-20T20:00:00Z',
    venueName: 'Marina Convention Center',
  },
  {
    id: 2,
    eventCode: 'TECH-CONF-26',
    name: 'Tech Summit Caribbean',
    category: 'TECHNOLOGY',
    status: 'SOLD_OUT',
    eventDate: '2026-12-05T09:00:00Z',
    venueName: 'Centro de Convenciones',
  },
]

const MOCK_EVENTO_DETALLE: EventResponse = {
  id: 1,
  eventCode: 'CMF-2026',
  name: 'Caribbean Music Fest 2026',
  description: 'El mayor festival de música del Caribe.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-11-20T20:00:00Z',
  minimumAge: 18,
  streamingUrl: 'https://stream.pulsepass.com/cmf2026',
  venueCode: 'VEN-SMR-01',
  venueName: 'Marina Convention Center',
  artists: [
    {
      id: 10,
      stageName: 'Solar Beat',
      country: 'Colombia',
      genre: 'Electronic',
      active: true,
    },
  ],
}

describe('Catálogo y Detalle de Eventos (Etapa 6)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('CatalogoEventos: renderiza lista de eventos y permite filtrar por texto', () => {
    vi.spyOn(useEventosHooks, 'useEventosPublicados').mockReturnValue({
      data: MOCK_EVENTOS,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <CatalogoEventos />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Tech Summit Caribbean')).toBeInTheDocument()

    // Filtrar por texto
    const searchInput = screen.getByPlaceholderText(/Ej\. Caribbean/i)
    fireEvent.change(searchInput, { target: { value: 'Tech' } })

    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Tech Summit Caribbean')).toBeInTheDocument()
  })

  it('CatalogoEventos: filtra por categoría', () => {
    vi.spyOn(useEventosHooks, 'useEventosPublicados').mockReturnValue({
      data: MOCK_EVENTOS,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <CatalogoEventos />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    const selectCategoria = screen.getByLabelText(/Categoría/i)
    fireEvent.change(selectCategoria, { target: { value: 'MUSIC' } })

    expect(screen.getByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.queryByText('Tech Summit Caribbean')).not.toBeInTheDocument()
  })

  it('DetalleEvento: renderiza datos del evento, artistas y CTA de compra', () => {
    vi.spyOn(useEventosHooks, 'useEvento').mockReturnValue({
      data: MOCK_EVENTO_DETALLE,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/eventos/CMF-2026']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Caribbean Music Fest 2026/i })).toBeInTheDocument()
    expect(screen.getByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText(/Mayores de 18 años/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Iniciar sesión para comprar/i })).toBeInTheDocument()
  })
})
