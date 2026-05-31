import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { registrar } = useAuth()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirm: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { nombre, apellido, email, password, confirm } = form

    if (!nombre || !apellido || !email || !password)
      return setError('Por favor completa todos los campos.')
    if (password.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm)
      return setError('Las contraseñas no coinciden.')

    setLoading(true)
    setError('')
    try {
      await registrar({ nombre, apellido, email, password })
      navigate('/mapa', { replace: true })
    } catch (err) {
      setError(
        err.message.includes('already registered')
          ? 'Este correo ya está registrado.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return Math.min(s, 4)
  })()

  const strengthColors = ['', 'bg-red-500', 'bg-amber-400', 'bg-verde-500', 'bg-verde-400']
  const strengthLabels = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte']

  return (
    <div className="flex flex-col min-h-dvh bg-oscuro-900">
      <div className="absolute inset-0 bg-gradient-to-br from-oscuro-800 via-oscuro-900 to-oscuro-950 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full
                      bg-verde-500/4 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col flex-1 px-6 max-w-md mx-auto w-full">

        {/* Back */}
        <div className="pt-12 animate-fade-in">
          <button onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-gris-400 hover:text-white transition-colors text-sm font-medium group">
            <span className="w-8 h-8 rounded-xl bg-oscuro-700/80 border border-oscuro-500
                             flex items-center justify-center group-hover:border-verde-500/50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Atrás
          </button>
        </div>

        {/* Encabezado */}
        <div className="mt-6 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <h1 className="text-3xl font-bold text-white tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-gris-400 text-sm">Únete a la comunidad vial de Medellín</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>

          {/* Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nombre" className="field-label">Nombre</label>
              <input id="nombre" name="nombre" type="text" autoComplete="given-name"
                     placeholder="Carlos" value={form.nombre} onChange={onChange}
                     className="input-field" />
            </div>
            <div>
              <label htmlFor="apellido" className="field-label">Apellido</label>
              <input id="apellido" name="apellido" type="text" autoComplete="family-name"
                     placeholder="García" value={form.apellido} onChange={onChange}
                     className="input-field" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="field-label">Correo electrónico</label>
            <div className="relative">
              <input id="email" name="email" type="email" autoComplete="email"
                     inputMode="email" placeholder="tucorreo@ejemplo.com"
                     value={form.email} onChange={onChange}
                     className="input-field pl-11" />
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
              <input id="password" name="password"
                     type={showPwd ? 'text' : 'password'}
                     autoComplete="new-password"
                     placeholder="Mínimo 6 caracteres"
                     value={form.password} onChange={onChange}
                     className="input-field pl-11 pr-11" />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gris-500 pointer-events-none"
                   width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gris-500 hover:text-gris-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            {/* Indicador de fuerza */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i}
                         className={`h-1 flex-1 rounded-full transition-all duration-300
                                    ${i <= strength ? strengthColors[strength] : 'bg-oscuro-500'}`} />
                  ))}
                </div>
                <p className="text-xs text-gris-400">{strengthLabels[strength]}</p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirm" className="field-label">Confirmar contraseña</label>
            <div className="relative">
              <input id="confirm" name="confirm"
                     type={showPwd ? 'text' : 'password'}
                     autoComplete="new-password" placeholder="Repite tu contraseña"
                     value={form.confirm} onChange={onChange}
                     className={`input-field pl-11 pr-10 ${
                       form.confirm && form.confirm !== form.password
                         ? 'border-red-500/50 focus:border-red-500'
                         : form.confirm && form.confirm === form.password
                         ? 'border-verde-500/50 focus:border-verde-500'
                         : ''
                     }`} />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gris-500 pointer-events-none"
                   width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {form.confirm && form.confirm === form.password && (
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-verde-400"
                     width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l5 5 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
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
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-oscuro-800/40 border-t-oscuro-800
                                   rounded-full animate-spin" />
                  Creando cuenta…
                </span>
              : 'Crear cuenta'
            }
          </button>
        </form>

        {/* Pie */}
        <p className="text-center text-gris-400 text-sm mt-5 pb-8 animate-fade-up"
           style={{ animationDelay: '150ms' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-verde-400 hover:text-verde-300 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
