import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import Login from '@/pages/Login'
import Registro from '@/pages/Registro'
import { usuariosServicio } from '@/funcionalidades/usuarios/servicio'

// Mock de useAuth para Login
const mockIniciarSesion = vi.fn()
vi.mock('@/funcionalidades/auth/useAuth', () => ({
  useAuth: () => ({
    sesion: { estado: 'anonimo' },
    iniciarSesion: mockIniciarSesion,
    cerrarSesion: vi.fn(),
    tieneRol: vi.fn(() => false),
  }),
}))

describe('Módulo de Autenticación y Registro (Etapa 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('Login: valida que los campos sean requeridos', async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Login />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    const submitBtn = screen.getByRole('button', { name: /Ingresar a PulsePass/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/El nombre de usuario o correo es obligatorio/i)).toBeInTheDocument()
      expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument()
    })
    expect(mockIniciarSesion).not.toHaveBeenCalled()
  })

  it('Registro: valida contraseña con mínimo 12 caracteres', async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Registro />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    const passwordInput = screen.getByLabelText(/^Contraseña/i)
    fireEvent.change(passwordInput, { target: { value: 'corta123' } })

    const submitBtn = screen.getByRole('button', { name: /Crear mi cuenta/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/La contraseña debe tener al menos 12 caracteres/i)).toBeInTheDocument()
    })
  })

  it('Registro: envía datos correctos a usuariosServicio.registrar', async () => {
    const spyRegistrar = vi.spyOn(usuariosServicio, 'registrar').mockResolvedValue({
      id: 1,
      username: 'carolina',
      email: 'carolina@example.com',
      active: true,
      firstName: 'Carolina',
      lastName: 'Herrera',
      birthDate: '1995-05-15',
    })

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Registro />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), { target: { value: 'carolina' } })
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'carolina@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: 'PasswordSegura123!' } })
    fireEvent.change(screen.getByPlaceholderText('Andrea'), { target: { value: 'Carolina' } })
    fireEvent.change(screen.getByPlaceholderText('Gómez'), { target: { value: 'Herrera' } })
    fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/i), { target: { value: '1995-05-15' } })

    const submitBtn = screen.getByRole('button', { name: /Crear mi cuenta/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(spyRegistrar).toHaveBeenCalledTimes(1)
    })
  })
})
