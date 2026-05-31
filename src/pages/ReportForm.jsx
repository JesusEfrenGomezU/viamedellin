import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase, subirFoto } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/* ── Tipos de daño disponibles ── */
const TIPOS = [
  'Hueco/bache', 'Grieta', 'Hundimiento',
  'Daño en bordillo', 'Señalización dañada', 'Otro',
]

/* ── Icono verde para el marcador del form ── */
const ICONO_VERDE = L.divIcon({
  className: 'vm-marker',
  html: '<div class="vm-marker-dot" style="background:#4CC85A;width:22px;height:22px;border-color:white"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

/* ── Componente: marcador arrastrable ── */
function MarcadorArrastrable({ position, onChange }) {
  const markerRef = useRef(null)

  return (
    <Marker
      draggable
      position={position}
      icon={ICONO_VERDE}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current
          if (m) {
            const { lat, lng } = m.getLatLng()
            onChange(lat, lng)
          }
        },
      }}
    />
  )
}

/* ── Componente: click en mapa para mover marcador ── */
function ClickMapa({ onChange }) {
  useMapEvents({
    click(e) { onChange(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

/* ── Back button ── */
function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)}
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
  )
}

export default function ReportForm() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    tipo:      TIPOS[0],
    urgencia:  'media',
    descripcion: '',
  })
  const [posicion,  setPosicion]  = useState([6.2442, -75.5812])
  const [direccion, setDireccion] = useState('Obteniendo ubicación…')
  const [foto,      setFoto]      = useState(null)
  const [preview,   setPreview]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState(false)
  const [localizando, setLocalizando] = useState(true)

  /* ── Obtener GPS al montar ── */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setPosicion([lat, lng])
        geocodificar(lat, lng)
        setLocalizando(false)
      },
      () => {
        setDireccion('Medellín, Colombia (GPS no disponible)')
        setLocalizando(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  /* ── Geocodificación inversa con Nominatim ── */
  async function geocodificar(lat, lng) {
    setDireccion('Buscando dirección…')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      const addr = data.address
      const dir = [
        addr.road,
        addr.house_number,
        addr.suburb || addr.neighbourhood || addr.district,
        addr.city || 'Medellín',
      ].filter(Boolean).join(', ')
      setDireccion(dir || data.display_name || 'Dirección no disponible')
    } catch {
      setDireccion(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }
  }

  function alMoverMarcador(lat, lng) {
    setPosicion([lat, lng])
    geocodificar(lat, lng)
  }

  function alSeleccionarFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no puede pesar más de 5 MB.')
      return
    }
    setFoto(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  function quitarFoto() {
    if (preview) URL.revokeObjectURL(preview)
    setFoto(null)
    setPreview('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!form.tipo || !form.urgencia) return setError('Por favor completa todos los campos.')
    setLoading(true)
    setError('')

    try {
      let foto_url = ''
      if (foto) {
        foto_url = await subirFoto(foto, user.id)
      }

      const { error: dbError } = await supabase.from('reportes').insert({
        usuario_id:     user.id,
        tipo_daño:      form.tipo,
        nivel_urgencia: form.urgencia,
        latitud:        posicion[0],
        longitud:       posicion[1],
        direccion,
        descripcion:    form.descripcion,
        foto_url,
        estado: form.urgencia === 'alta' ? 'urgente' : 'pendiente',
      })

      if (dbError) throw dbError

      setExito(true)
      setTimeout(() => navigate('/mapa', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || 'Error al enviar el reporte. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Pantalla de éxito ── */
  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-oscuro-900 gap-5 px-8">
        <div className="w-20 h-20 rounded-full bg-verde-500/15 border border-verde-500/40
                        flex items-center justify-center animate-pulse-glow">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20l8 8 14-16" stroke="#4CC85A" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">¡Reporte enviado!</h2>
          <p className="text-gris-400 text-sm">Tu reporte fue registrado y ya es visible en el mapa.</p>
        </div>
      </div>
    )
  }

  const URGENCIAS = [
    { key: 'alta',  label: 'Alta',  color: 'red'   },
    { key: 'media', label: 'Media', color: 'amber' },
    { key: 'baja',  label: 'Baja',  color: 'green' },
  ]

  const urgColorMap = {
    red:   { sel: 'bg-red-500/20 border-red-500/60 text-red-300',    unsel: 'bg-oscuro-700/60 border-oscuro-500 text-gris-400 hover:border-red-500/30' },
    amber: { sel: 'bg-amber-500/20 border-amber-500/60 text-amber-300', unsel: 'bg-oscuro-700/60 border-oscuro-500 text-gris-400 hover:border-amber-500/30' },
    green: { sel: 'bg-verde-500/20 border-verde-500/60 text-verde-300', unsel: 'bg-oscuro-700/60 border-oscuro-500 text-gris-400 hover:border-verde-500/30' },
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-oscuro-900">

      {/* ── HEADER ── */}
      <div className="px-5 pt-12 pb-4 border-b border-oscuro-600 bg-oscuro-800 flex-shrink-0">
        <BackButton to="/mapa" />
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Reportar daño vial</h1>
          <p className="text-gris-400 text-sm mt-1">Completa la información del reporte</p>
        </div>
      </div>

      {/* ── CONTENIDO con scroll ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Layout responsive: formulario + mapa lado a lado en PC */}
        <div className="lg:flex lg:h-full">

          {/* Formulario */}
          <form onSubmit={onSubmit}
                className="flex flex-col gap-5 px-5 py-5 lg:w-[420px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-r lg:border-oscuro-600">

            {/* Tipo de daño */}
            <div>
              <label className="field-label">Tipo de daño</label>
              <div className="relative">
                <select
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="input-field pr-10 appearance-none cursor-pointer"
                >
                  {TIPOS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gris-400 pointer-events-none"
                     width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Nivel de urgencia */}
            <div>
              <label className="field-label">Nivel de urgencia</label>
              <div className="flex gap-2">
                {URGENCIAS.map(u => {
                  const c = urgColorMap[u.color]
                  const sel = form.urgencia === u.key
                  return (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, urgencia: u.key }))}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium
                                  transition-all duration-150 active:scale-95
                                  ${sel ? c.sel : c.unsel}`}
                    >
                      {u.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="field-label">Ubicación</label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl
                              bg-oscuro-700 border border-oscuro-500">
                <svg className="text-verde-500 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2C5.791 2 4 3.791 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.209-1.791-4-4-4z"
                        fill="rgba(76,200,90,0.2)" stroke="#4CC85A" strokeWidth="1.5"/>
                  <circle cx="8" cy="6" r="1.5" fill="#4CC85A"/>
                </svg>
                <span className="text-sm text-gris-400 flex-1 truncate min-w-0">
                  {localizando
                    ? <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border border-verde-500 border-t-transparent rounded-full animate-spin" />
                        Localizando…
                      </span>
                    : direccion
                  }
                </span>
                <button
                  type="button"
                  onClick={() => navigator.geolocation?.getCurrentPosition(
                    pos => {
                      const { latitude: lat, longitude: lng } = pos.coords
                      setPosicion([lat, lng])
                      geocodificar(lat, lng)
                    },
                    () => {}
                  )}
                  className="flex-shrink-0 text-xs text-verde-400 hover:text-verde-300
                             font-medium transition-colors px-2 py-1 rounded-lg hover:bg-verde-500/10"
                >
                  GPS
                </button>
              </div>
              <p className="text-xs text-gris-500 mt-1.5">
                💡 Arrastra el marcador verde en el mapa para ajustar la ubicación
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="field-label">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Describe el daño: tamaño aproximado, riesgo, cuánto tiempo lleva así…"
                rows={3}
                className="input-field resize-none leading-relaxed text-sm"
              />
            </div>

            {/* Foto */}
            <div>
              <label className="field-label">Foto del daño</label>
              {preview
                ? <div className="relative rounded-xl overflow-hidden">
                    <img src={preview} alt="preview"
                         className="w-full h-44 object-cover rounded-xl" />
                    <button type="button" onClick={quitarFoto}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full
                                       bg-oscuro-900/80 border border-oscuro-600
                                       flex items-center justify-center text-gris-400
                                       hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg
                                    bg-oscuro-900/80 text-xs text-verde-400 font-medium">
                      Foto lista ✓
                    </div>
                  </div>
                : <label className="flex flex-col items-center justify-center gap-3 h-36
                                    rounded-xl border-2 border-dashed border-oscuro-500
                                    hover:border-verde-500/50 transition-colors cursor-pointer
                                    bg-oscuro-700/40 hover:bg-oscuro-700/60">
                    <div className="w-12 h-12 rounded-2xl bg-oscuro-600 flex items-center justify-center">
                      <svg className="text-gris-500" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gris-400">Toca para agregar foto</p>
                      <p className="text-xs text-gris-500 mt-0.5">JPG, PNG, WEBP · máx. 5 MB</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment"
                           onChange={alSeleccionarFoto} className="sr-only" />
                  </label>
              }
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

            {/* Botón enviar */}
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-oscuro-800/40 border-t-oscuro-800
                                     rounded-full animate-spin" />
                    Enviando reporte…
                  </span>
                : <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2C6.239 2 4 4.239 4 7c0 4.5 5 9 5 9s5-4.5 5-9c0-2.761-2.239-5-5-5z"
                            fill="rgba(13,18,32,0.3)" stroke="rgba(13,18,32,0.8)" strokeWidth="1.5"/>
                      <circle cx="9" cy="7" r="2" fill="rgba(13,18,32,0.8)"/>
                    </svg>
                    Enviar reporte
                  </span>
              }
            </button>

            {/* Padding bottom en móvil */}
            <div className="pb-4 lg:pb-0" />
          </form>

          {/* Mapa (visible en todos, pero especialmente grande en PC) */}
          <div className="h-72 lg:flex-1 lg:h-full relative">
            <MapContainer
              center={posicion}
              zoom={15}
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                subdomains="abcd"
                maxZoom={19}
              />
              <ClickMapa onChange={alMoverMarcador} />
              <MarcadorArrastrable position={posicion} onChange={alMoverMarcador} />
            </MapContainer>

            {/* Instrucción overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-oscuro-800/90 border border-oscuro-600
                              text-xs text-gris-400 backdrop-blur-sm whitespace-nowrap shadow-card">
                📍 Arrastra el marcador para ajustar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
