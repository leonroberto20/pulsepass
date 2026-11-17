import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza el título de PulsePass', () => {
    render(<App />)
    expect(screen.getByText(/PulsePass Web/i)).toBeInTheDocument()
    expect(screen.getByText(/Eventos, Artistas y Entradas/i)).toBeInTheDocument()
  })
})
