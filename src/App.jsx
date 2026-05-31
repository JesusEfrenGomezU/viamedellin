import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute  from './components/ProtectedRoute'
import Welcome         from './pages/Welcome'
import Login           from './pages/Login'
import Register        from './pages/Register'
import MapView         from './pages/MapView'
import ReportForm      from './pages/ReportForm'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/"          element={<Welcome  />} />
          <Route path="/login"     element={<Login    />} />
          <Route path="/registro"  element={<Register />} />

          {/* Privadas */}
          <Route path="/mapa" element={
            <ProtectedRoute><MapView /></ProtectedRoute>
          }/>
          <Route path="/reportar" element={
            <ProtectedRoute><ReportForm /></ProtectedRoute>
          }/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
