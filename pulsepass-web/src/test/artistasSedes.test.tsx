import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ListaArtistas from '@/pages/ListaArtistas'
import DetalleArtista from '@/pages/DetalleArtista'
import ListaSedes from '@/pages/ListaSedes'
import DetalleSede from '@/pages/DetalleSede'
import * as useArtistasHooks from '@/funcionalidades/artistas/useArtistas'
import * as useSedesHooks from '@/funcionalidades/sedes/useSedes'
import * as useEventosHooks from '@/funcionalidades/eventos/useEventos'

vi.mock('@/funcionalidades/artistas/useArtistas')
vi.mock('@/funcionalidades/sedes/useSedes')
vi.mock('@/funcionalidades/eventos/useEventos')

describe('Módulos de Artistas y Sedes (Etapa 7)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('ListaArtistas: lista artistas activos y permite búsqueda por nombre', () => {
    vi.spyOn(useArtistasHooks, 'useArtistasActivos').mockReturnValue({
      data: [
        { id: 1, stageName: 'Solar Beat', genre: 'Electronic', country: 'Colombia', active: true },
        { id: 2, stageName: 'Luna Mar', genre: 'Indie', country: 'México', active: true },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ListaArtistas />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Luna Mar')).toBeInTheDocument()

    // Búsqueda
    const input = screen.getByPlaceholderText(/Nombre artístico/i)
    fireEvent.change(input, { target: { value: 'Solar' } })

    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.queryByText('Luna Mar')).not.toBeInTheDocument()
  })

  it('DetalleArtista: muestra ficha y eventos asociados', () => {
    vi.spyOn(useArtistasHooks, 'useArtista').mockReturnValue({
      data: { id: 1, stageName: 'Solar Beat', genre: 'Electronic', country: 'Colombia', active: true },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(useEventosHooks, 'useEventosPorArtista').mockReturnValue({
      data: [
        {
          id: 10,
          eventCode: 'CMF-2026',
          name: 'Caribbean Music Fest 2026',
          category: 'MUSIC',
          status: 'PUBLISHED',
          eventDate: '2026-11-20T20:00:00Z',
          venueName: 'Marina Convention Center',
        },
      ],
      isLoading: false,
    } as any)

    render(
      <MemoryRouter initialEntries={['/artistas/1']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/artistas/:id" element={<DetalleArtista />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Solar Beat/i })).toBeInTheDocument()
    expect(screen.getByText('Caribbean Music Fest 2026')).toBeInTheDocument()
  })

  it('ListaSedes: lista sedes activas y muestra capacidad formateada', () => {
    vi.spyOn(useSedesHooks, 'useSedesActivas').mockReturnValue({
      data: [
        {
          id: 1,
          code: 'VEN-SMR-01',
          name: 'Marina Convention Center',
          city: 'Santa Marta',
          address: 'Cra 1 # 22-01',
          capacity: 5000,
          active: true,
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
          <ListaSedes />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText(/5\.000 personas/i)).toBeInTheDocument()
  })
})
