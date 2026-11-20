import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  Boton,
  Campo,
  Selector,
  Badge,
  Modal,
  Tabla,
  PrecioCOP,
  EstadoError,
} from '@/componentes'

describe('Componentes UI Genéricos (Etapa 3)', () => {
  it('Boton: renderiza variante primaria y reacciona al click', () => {
    const handleClick = vi.fn()
    render(<Boton onClick={handleClick}>Guardar</Boton>)

    const boton = screen.getByRole('button', { name: /Guardar/i })
    expect(boton).toBeInTheDocument()
    fireEvent.click(boton)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('Boton: deshabilitado cuando cargando es true', () => {
    render(<Boton cargando>Cargando datos</Boton>)
    const boton = screen.getByRole('button')
    expect(boton).toBeDisabled()
  })

  it('Campo: asocia etiqueta por id y muestra error accesible', () => {
    render(<Campo etiqueta="Correo electrónico" error="El correo es requerido" />)
    const input = screen.getByLabelText(/Correo electrónico/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const alertaError = screen.getByRole('alert')
    expect(alertaError).toHaveTextContent('El correo es requerido')
  })

  it('Selector: renderiza opciones y etiqueta', () => {
    const opciones = [
      { valor: 'MUSIC', etiqueta: 'Música' },
      { valor: 'SPORTS', etiqueta: 'Deportes' },
    ]
    render(<Selector etiqueta="Categoría" opciones={opciones} />)
    const select = screen.getByLabelText(/Categoría/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Música' })).toBeInTheDocument()
  })

  it('Badge: renderiza estados de dominio y tonos', () => {
    render(<Badge tono="PUBLISHED">Publicado</Badge>)
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })

  it('Modal: se abre, muestra contenido y responde a Escape', () => {
    const handleCerrar = vi.fn()
    const { rerender } = render(
      <Modal abierto={false} titulo="Test Modal" onCerrar={handleCerrar}>
        Contenido modal
      </Modal>,
    )
    expect(screen.queryByText('Contenido modal')).not.toBeInTheDocument()

    rerender(
      <Modal abierto={true} titulo="Test Modal" onCerrar={handleCerrar}>
        Contenido modal
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Contenido modal')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleCerrar).toHaveBeenCalled()
  })

  it('Tabla: renderiza encabezados y filas correctamente', () => {
    interface FilaDemo {
      id: number
      nombre: string
    }
    const columnas = [
      { encabezado: 'ID', celda: (f: FilaDemo) => f.id },
      { encabezado: 'Nombre', celda: (f: FilaDemo) => f.nombre },
    ]
    const filas: FilaDemo[] = [
      { id: 1, nombre: 'Elemento A' },
      { id: 2, nombre: 'Elemento B' },
    ]

    render(<Tabla columnas={columnas} filas={filas} claveFila={(f) => f.id} />)
    expect(screen.getByText('Elemento A')).toBeInTheDocument()
    expect(screen.getByText('Elemento B')).toBeInTheDocument()
  })

  it('PrecioCOP: formatea montos en pesos colombianos (COP)', () => {
    render(<PrecioCOP valor={250000} />)
    // En formato es-CO aparece como $ 250.000 o similar
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
  })

  it('EstadoError: llama a onReintentar al hacer click', () => {
    const handleReintentar = vi.fn()
    render(<EstadoError onReintentar={handleReintentar} />)
    const boton = screen.getByRole('button', { name: /Reintentar/i })
    fireEvent.click(boton)
    expect(handleReintentar).toHaveBeenCalledTimes(1)
  })
})
