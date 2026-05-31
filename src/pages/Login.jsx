import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2 text-gris-400 hover:text-white
                 transition-colors text-sm font-medium group"
    >
      <span className="w-8 h-8 rounded-xl bg-oscuro-700/80 border border-oscuro-500
                       flex items-center justify-center group-hover:border-verde-500/50 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      Atrás
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await iniciarSesion(form)
      navigate('/mapa', { replace: true })
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-oscuro-900">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-oscuro-800 via-oscuro-900 to-oscuro-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full
                      bg-verde-500/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col flex-1 px-6 max-w-md mx-auto w-full">

        {/* Back */}
        <div className="pt-12 pb-2 animate-fade-in">
          <BackButton to="/" />
        </div>

        {/* Encabezado */}
        <div className="mt-6 mb-8 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
          <p className="mt-2 text-gris-400 text-sm">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-5 animate-fade-up" style={{ animationDelay: '100ms' }}>

          {/* Email */}
          <div>
            <label htmlFor="email" className="field-label">Correo electrónico</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.email}
                onChange={onChange}
                className="input-field pl-11"
                inputMode="email"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gris-500 pointer-events-none"
                   width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z"
                      stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 6l7 6 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="field-label">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                className="input-field pl-11 pr-11"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gris-500 pointer-events-none"
                   width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="9" width="14" height="10" rx="2"
                      stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gris-500 hover:text-gris-400 transition-colors">
                {showPwd
                  ? <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  : <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                            bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5M8 10.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Botón */}
          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-oscuro-800/40 border-t-oscuro-800
                                   rounded-full animate-spin" />
                  Ingresando…
                </span>
              : 'Iniciar sesión'
            }
          </button>
        </form>

        {/* Pie */}
        <p className="text-center text-gris-400 text-sm mt-6 animate-fade-up"
           style={{ animationDelay: '150ms' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-verde-400 hover:text-verde-300 font-medium transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
