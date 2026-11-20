import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { Layout } from '@/layouts/Layout'
import { RutaProtegida } from '@/layouts/RutaProtegida'
import { RutaPorRol } from '@/layouts/RutaPorRol'
import { SoloAnonimo } from '@/layouts/SoloAnonimo'
import { Cargando } from '@/componentes'
import ErrorPagina from '@/pages/ErrorPagina'
import SinPermisos from '@/pages/SinPermisos'
import NoEncontrada from '@/pages/NoEncontrada'
import Inicio from '@/pages/Inicio'

// Carga perezosa (lazy) de las páginas secundarias
const CatalogoEventos = lazy(() => import('@/pages/CatalogoEventos'))
const DetalleEvento = lazy(() => import('@/pages/DetalleEvento'))
const ListaArtistas = lazy(() => import('@/pages/ListaArtistas'))
const DetalleArtista = lazy(() => import('@/pages/DetalleArtista'))
const ListaSedes = lazy(() => import('@/pages/ListaSedes'))
const DetalleSede = lazy(() => import('@/pages/DetalleSede'))
const Login = lazy(() => import('@/pages/Login'))
const Registro = lazy(() => import('@/pages/Registro'))
const Cuenta = lazy(() => import('@/pages/Cuenta'))
const MisTickets = lazy(() => import('@/pages/MisTickets'))
const DetalleTicket = lazy(() => import('@/pages/DetalleTicket'))
const ConfirmacionCompra = lazy(() => import('@/pages/ConfirmacionCompra'))
const ValidacionIngreso = lazy(() => import('@/pages/ValidacionIngreso'))
const TicketsPagadosEvento = lazy(() => import('@/pages/TicketsPagadosEvento'))
const AdminEventos = lazy(() => import('@/pages/AdminEventos'))
const AdminCrearEvento = lazy(() => import('@/pages/AdminCrearEvento'))
const AdminGestionEvento = lazy(() => import('@/pages/AdminGestionEvento'))

function suspender(componente: ReactNode) {
  return <Suspense fallback={<Cargando mensaje="Cargando página..." />}>{componente}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPagina />,
    children: [
      // Públicas
      { index: true, element: <Inicio /> },
      { path: 'eventos', element: suspender(<CatalogoEventos />) },
      { path: 'eventos/:eventCode', element: suspender(<DetalleEvento />) },
      { path: 'artistas', element: suspender(<ListaArtistas />) },
      { path: 'artistas/:id', element: suspender(<DetalleArtista />) },
      { path: 'sedes', element: suspender(<ListaSedes />) },
      { path: 'sedes/:code', element: suspender(<DetalleSede />) },

      // Solo Anónimos (Login, Registro)
      {
        element: <SoloAnonimo />,
        children: [
          { path: 'login', element: suspender(<Login />) },
          { path: 'registro', element: suspender(<Registro />) },
        ],
      },

      // Protegidas: Requieren Autenticación (USER, STAFF, ADMIN)
      {
        element: <RutaProtegida />,
        children: [
          { path: 'cuenta', element: suspender(<Cuenta />) },
          { path: 'mis-tickets', element: suspender(<MisTickets />) },
          { path: 'mis-tickets/:ticketCode', element: suspender(<DetalleTicket />) },
          { path: 'compra/confirmacion/:ticketCode', element: suspender(<ConfirmacionCompra />) },
        ],
      },

      // Protegidas: Rol STAFF o ADMIN
      {
        element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
        children: [
          { path: 'staff/validacion', element: suspender(<ValidacionIngreso />) },
          { path: 'staff/eventos/:eventCode/tickets', element: suspender(<TicketsPagadosEvento />) },
        ],
      },

      // Protegidas: Rol ADMIN exclusivo
      {
        element: <RutaPorRol roles={['ADMIN']} />,
        children: [
          { path: 'admin/eventos', element: suspender(<AdminEventos />) },
          { path: 'admin/eventos/nuevo', element: suspender(<AdminCrearEvento />) },
          { path: 'admin/eventos/:eventCode', element: suspender(<AdminGestionEvento />) },
        ],
      },

      // Errores HTTP
      { path: '403', element: <SinPermisos /> },
      { path: '404', element: <NoEncontrada /> },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])
