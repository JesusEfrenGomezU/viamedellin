import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/* ── Colores y etiquetas de estado ── */
const ESTADO = {
  urgente:  { color: '#EF4444', label: 'Urgente',  bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/20'   },
  pendiente:{ color: '#F59E0B', label: 'Pendiente', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  resuelto: { color: '#22C55E', label: 'Resuelto',  bg: 'bg-verde-500/15', text: 'text-verde-400', border: 'border-verde-500/20' },
}

/* ── Icono de marcador circular con color ── */
function crearIcono(estado) {
  const { color } = ESTADO[estado] || ESTADO.pendiente
  return L.divIcon({
    className: 'vm-marker',
    html: `<div class="vm-marker-dot" style="background:${color}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  })
}

/* ── Componente: recenter map ── */
function SetView({ center }) {
  const map = useMap()
  useEffect(() => { map.setView(center, map.getZoom()) }, [center, map])
  return null
}

/* ── Chip de estado ── */
function EstadoBadge({ estado }) {
  const s = ESTADO[estado] || ESTADO.pendiente
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${s.bg} ${s.text} border ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

/* ── Formatea fecha ── */
function formatFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function MapView() {
  const navigate = useNavigate()
  const { user, perfil, cerrarSesion } = useAuth()
  const [reportes,    setReportes]    = useState([])
  const [cargando,    setCargando]    = useState(true)
  const [filtro,      setFiltro]      = useState('todos')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* Medellín coords */
  const CENTRO = [6.2442, -75.5812]

  /* ── Cargar reportes ── */
  const cargarReportes = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setReportes(data || [])
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarReportes()
    /* Suscripción en tiempo real */
    const channel = supabase
      .channel('reportes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, cargarReportes)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [cargarReportes])

  const reportesFiltrados = filtro === 'todos'
    ? reportes
    : reportes.filter(r => r.estado === filtro)

  async function handleLogout() {
    await cerrarSesion()
    navigate('/', { replace: true })
  }

  const tiposIcono = {
    'Hueco/bache': '🕳️', 'Grieta': '⚡', 'Hundimiento': '⬇️',
    'Daño en bordillo': '🧱', 'Señalización dañada': '🚧', 'Otro': '⚠️',
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-oscuro-900">

      {/* ── PANEL LATERAL (PC) + Drawer (móvil) ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col
        w-80 bg-oscuro-800 border-r border-oscuro-600
        transition-transform duration-300 shadow-card
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header sidebar */}
        <div className="px-5 pt-5 pb-4 border-b border-oscuro-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-verde-500/15 border border-verde-500/30
                              flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C7.239 2 5 4.239 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.761-2.239-5-5-5z"
                        fill="rgba(76,200,90,0.3)" stroke="#4CC85A" strokeWidth="1.5"/>
                  <circle cx="10" cy="7" r="2" fill="#4CC85A"/>
                </svg>
              </div>
              <span className="font-bold text-white">
                <span className="text-verde-400">Vía</span>Medellín
              </span>
            </div>
            {/* Close (solo móvil) */}
            <button onClick={() => setSidebarOpen(false)}
                    className="lg:hidden w-7 h-7 rounded-lg bg-oscuro-700 flex items-center justify-center
                               text-gris-400 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Perfil del usuario */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-oscuro-700/60 border border-oscuro-500/40">
            <div className="w-9 h-9 rounded-full bg-gradient-verde flex items-center justify-center
                            text-oscuro-900 font-bold text-sm flex-shrink-0">
              {perfil?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : 'Usuario'}
              </p>
              <p className="text-xs text-gris-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-5 py-4 border-b border-oscuro-600">
          <p className="text-xs font-medium text-gris-400 uppercase tracking-widest mb-3">Filtrar por estado</p>
          <div className="space-y-1.5">
            {[
              { key: 'todos', label: 'Todos', count: reportes.length, color: null },
              ...Object.entries(ESTADO).map(([k, v]) => ({
                key: k, label: v.label, color: v.color,
                count: reportes.filter(r => r.estado === k).length,
              }))
            ].map(f => (
              <button key={f.key}
                      onClick={() => setFiltro(f.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm
                                  transition-all duration-150 ${
                        filtro === f.key
                          ? 'bg-verde-500/15 border border-verde-500/30 text-verde-400'
                          : 'hover:bg-oscuro-700/60 text-gris-400 border border-transparent'
                      }`}>
                <span className="flex items-center gap-2.5">
                  {f.color && <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />}
                  {!f.color && <span className="w-2 h-2 rounded-full bg-gris-500" />}
                  {f.label}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filtro === f.key ? 'bg-verde-500/25 text-verde-400' : 'bg-oscuro-600 text-gris-400'
                }`}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cargando
            ? Array.from({length: 3}).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-oscuro-700/50 animate-pulse" />
              ))
            : reportesFiltrados.length === 0
            ? <div className="text-center py-10">
                <div className="text-3xl mb-3">🗺️</div>
                <p className="text-gris-400 text-sm">Sin reportes{filtro !== 'todos' ? ` ${ESTADO[filtro]?.label.toLowerCase()}s` : ''}</p>
              </div>
            : reportesFiltrados.map(r => (
                <div key={r.id}
                     className="p-3 rounded-xl bg-oscuro-700/50 border border-oscuro-500/30
                                hover:border-oscuro-400/50 transition-all cursor-default">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{tiposIcono[r.tipo_daño] || '⚠️'}</span>
                      <span className="text-sm font-medium text-white truncate">{r.tipo_daño}</span>
                    </div>
                    <EstadoBadge estado={r.estado} />
                  </div>
                  {r.descripcion && (
                    <p className="text-xs text-gris-400 line-clamp-2 mb-2">{r.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gris-500">
                    <span className="truncate">{r.direccion || 'Sin dirección'}</span>
                    <span className="flex-shrink-0 ml-2">{formatFecha(r.created_at)}</span>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Footer sidebar */}
        <div className="px-5 pb-5 pt-3 border-t border-oscuro-600 space-y-2">
          <button onClick={() => { navigate('/reportar'); setSidebarOpen(false) }}
                  className="btn-primary">
            + Reportar daño
          </button>
          <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm
                             text-gris-400 hover:text-red-400 transition-colors rounded-xl
                             hover:bg-red-500/5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Overlay móvil ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
             className="fixed inset-0 z-20 bg-oscuro-950/70 lg:hidden" />
      )}

      {/* ── MAPA ── */}
      <div className="relative flex-1">
        <MapContainer
          center={CENTRO}
          zoom={13}
          className="w-full h-full"
          zoomControl={true}
          attributionControl={true}
        >
          {/* Tiles oscuros (CartoDB Dark Matter) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
            subdomains="abcd"
          />

          {reportesFiltrados.map(r => (
            <Marker
              key={r.id}
              position={[r.latitud, r.longitud]}
              icon={crearIcono(r.estado)}
            >
              <Popup>
                <div className="min-w-[180px]">
                  {/* Foto */}
                  {r.foto_url && (
                    <img src={r.foto_url} alt="daño"
                         className="w-full h-24 object-cover rounded-lg mb-3"
                         style={{ borderRadius: '10px', marginBottom: '10px' }} />
                  )}
                  {/* Tipo */}
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '18px' }}>{tiposIcono[r.tipo_daño] || '⚠️'}</span>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>{r.tipo_daño}</span>
                  </div>
                  {/* Estado */}
                  <div style={{ marginBottom: '8px' }}>
                    <EstadoBadge estado={r.estado} />
                  </div>
                  {/* Descripción */}
                  {r.descripcion && (
                    <p style={{ fontSize: '12px', color: '#8BA3BF', marginBottom: '6px', lineHeight: 1.5 }}>
                      {r.descripcion}
                    </p>
                  )}
                  {/* Urgencia */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5E7A9A' }}>
                    <span>Urgencia: <b style={{ color: 'white' }}>{r.nivel_urgencia}</b></span>
                    <span>{formatFecha(r.created_at)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* ── Barra top del mapa ── */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3">
          {/* Botón menú (móvil) */}
          <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl bg-oscuro-800/95 border border-oscuro-600
                             flex items-center justify-center shadow-card backdrop-blur-sm
                             text-gris-400 hover:text-white transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Buscador decorativo / contador */}
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-oscuro-800/95 border border-oscuro-600
                          backdrop-blur-sm shadow-card flex items-center gap-2.5">
            <svg className="text-gris-500 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-gris-400 text-sm flex-1">
              {cargando ? 'Cargando reportes…' : `${reportesFiltrados.length} reportes en el mapa`}
            </span>
          </div>
        </div>

        {/* ── Leyenda ── */}
        <div className="absolute top-20 right-4 z-10">
          <div className="bg-oscuro-800/95 border border-oscuro-600 rounded-xl px-3 py-2.5
                          shadow-card backdrop-blur-sm space-y-1.5">
            {Object.entries(ESTADO).map(([k, v]) => (
              <button key={k}
                      onClick={() => setFiltro(prev => prev === k ? 'todos' : k)}
                      className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                  filtro === k ? 'ring-2 ring-white/30 scale-125' : ''
                }`} style={{ background: v.color }} />
                <span className={filtro === k ? 'text-white font-medium' : 'text-gris-400'}>
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Botón reportar (móvil) ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 lg:hidden">
          <button
            onClick={() => navigate('/reportar')}
            className="px-8 py-4 rounded-2xl bg-gradient-verde text-oscuro-900 font-semibold
                       shadow-glow text-sm tracking-wide active:scale-95 transition-transform
                       whitespace-nowrap flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C5.686 2 3 4.686 3 8c0 5.25 6 10 6 10s6-4.75 6-10c0-3.314-2.686-6-6-6z"
                    fill="rgba(13,18,32,0.3)" stroke="rgba(13,18,32,0.8)" strokeWidth="1.5"/>
              <circle cx="9" cy="8" r="2.5" fill="rgba(13,18,32,0.8)"/>
              <path d="M9 4.5V8.5M7 6.5h4" stroke="rgba(13,18,32,0.9)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Reportar daño
          </button>
        </div>
      </div>
    </div>
  )
}
