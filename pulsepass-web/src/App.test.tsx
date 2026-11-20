import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App y Enrutador Principal', () => {
  it('renderiza la página de Inicio de PulsePass con layout y navbar', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /PulsePass/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Vive la música y los mejores eventos/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver Cartelera/i })).toBeInTheDocument()
  })
})
