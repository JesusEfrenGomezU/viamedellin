import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-dvh bg-oscuro-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-verde-500 border-t-transparent animate-spin" />
          <p className="text-gris-400 text-sm">Cargando…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return children
}
