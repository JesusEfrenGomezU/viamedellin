import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* SVG inline del mapa de Medellín estilizado (fondo decorativo) */
function CityBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-b from-oscuro-800 via-oscuro-900 to-oscuro-950" />

      {/* Capa de "montañas" / horizonte con CSS */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-20"
        viewBox="0 0 390 260"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Silueta de montañas lejanas */}
        <path d="M0 200 Q60 120 120 160 Q180 100 240 150 Q300 80 360 130 L390 110 V260 H0Z"
              fill="rgba(13,18,32,0.9)" />
        {/* Capa frontal: edificios estilizados */}
        <rect x="10"  y="190" width="18" height="70"  fill="rgba(28,38,64,0.8)" />
        <rect x="14"  y="185" width="10" height="5"   fill="rgba(76,200,90,0.3)" />
        <rect x="35"  y="175" width="24" height="85"  fill="rgba(19,27,46,0.9)" />
        <rect x="38"  y="170" width="18" height="5"   fill="rgba(76,200,90,0.2)" />
        <rect x="65"  y="182" width="16" height="78"  fill="rgba(28,38,64,0.7)" />
        <rect x="88"  y="165" width="28" height="95"  fill="rgba(13,18,32,0.95)" />
        <rect x="91"  y="160" width="22" height="5"   fill="rgba(76,200,90,0.3)" />
        <rect x="122" y="178" width="20" height="82"  fill="rgba(28,38,64,0.8)" />
        <rect x="148" y="170" width="30" height="90"  fill="rgba(19,27,46,0.9)" />
        <rect x="151" y="164" width="24" height="6"   fill="rgba(76,200,90,0.25)" />
        <rect x="185" y="160" width="14" height="100" fill="rgba(28,38,64,0.75)" />
        <rect x="205" y="173" width="26" height="87"  fill="rgba(13,18,32,0.9)" />
        <rect x="208" y="168" width="20" height="5"   fill="rgba(76,200,90,0.4)" />
        <rect x="237" y="180" width="18" height="80"  fill="rgba(28,38,64,0.8)" />
        <rect x="261" y="168" width="24" height="92"  fill="rgba(19,27,46,0.9)" />
        <rect x="264" y="163" width="18" height="5"   fill="rgba(76,200,90,0.2)" />
        <rect x="291" y="175" width="20" height="85"  fill="rgba(13,18,32,0.85)" />
        <rect x="317" y="162" width="28" height="98"  fill="rgba(28,38,64,0.8)" />
        <rect x="320" y="157" width="22" height="5"   fill="rgba(76,200,90,0.35)" />
        <rect x="351" y="178" width="16" height="82"  fill="rgba(19,27,46,0.9)" />
        <rect x="373" y="170" width="22" height="90"  fill="rgba(13,18,32,0.9)" />
        {/* Luces de ventanas */}
        {[
          [36,188],[52,195],[38,202],[65,192],[70,200],[90,180],[95,190],
          [100,200],[125,188],[130,196],[150,182],[156,194],[186,172],[188,185],
          [207,180],[212,192],[238,190],[262,174],[268,187],[292,182],[318,172],
          [324,184],[352,188],[374,180]
        ].map(([x,y], i) => (
          <rect key={i} x={x} y={y} width="3" height="3"
                fill={`rgba(76,200,90,${0.4 + Math.sin(i)*0.3})`} />
        ))}
      </svg>

      {/* Grid de ciudad (perspectiva) */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-5"
           viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`v${i}`}
                x1={i * 30} y1="0" x2={i * 30} y2="844"
                stroke="#4CC85A" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 29 }, (_, i) => (
          <line key={`h${i}`}
                x1="0" y1={i * 30} x2="390" y2={i * 30}
                stroke="#4CC85A" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Puntos de reportes decorativos */}
      {[
        { x: '20%', y: '35%', color: '#EF4444', d: 0 },
        { x: '65%', y: '42%', color: '#F59E0B', d: 200 },
        { x: '45%', y: '55%', color: '#4CC85A', d: 400 },
        { x: '78%', y: '30%', color: '#EF4444', d: 100 },
        { x: '30%', y: '60%', color: '#4CC85A', d: 300 },
      ].map((dot, i) => (
        <div key={i}
             className="absolute rounded-full border-2 border-white/60 animate-pulse"
             style={{
               left: dot.x, top: dot.y,
               width: '12px', height: '12px',
               background: dot.color,
               animationDelay: `${dot.d}ms`,
               boxShadow: `0 0 12px ${dot.color}80`,
             }} />
      ))}

      {/* Viñeta superior oscura */}
      <div className="absolute inset-0 bg-gradient-to-b from-oscuro-950/80 via-transparent to-oscuro-950/95" />
    </div>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { user, cargando } = useAuth()

  useEffect(() => {
    if (!cargando && user) navigate('/mapa', { replace: true })
  }, [user, cargando, navigate])

  return (
    <div className="relative flex flex-col min-h-dvh overflow-hidden">
      <CityBackground />

      {/* Contenido */}
      <div className="relative flex flex-col flex-1 px-6 pt-safe">

        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 pt-16">

          {/* Logo icono */}
          <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="w-20 h-20 rounded-3xl bg-oscuro-700/80 border border-verde-500/30
                            flex items-center justify-center shadow-glow animate-pulse-glow backdrop-blur-sm">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 4C14.268 4 8 10.268 8 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z"
                      fill="rgba(76,200,90,0.15)" stroke="#4CC85A" strokeWidth="2"/>
                <circle cx="22" cy="18" r="5" fill="#4CC85A"/>
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="text-center animate-fade-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-verde-400">Vía</span>Medellín
            </h1>
            <p className="mt-3 text-gris-400 text-sm text-balance leading-relaxed max-w-[260px]">
              Reporta daños viales y ayuda a mantener la ciudad en buen estado
            </p>
          </div>

          {/* Stats decorativos */}
          <div className="flex gap-4 mt-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
            {[
              { n: '2.4K', l: 'Reportes' },
              { n: '98%', l: 'Atendidos' },
              { n: '16', l: 'Comunas' },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center px-4 py-3
                                        bg-oscuro-700/60 border border-oscuro-500/50
                                        rounded-2xl backdrop-blur-sm">
                <span className="text-xl font-bold text-verde-400">{s.n}</span>
                <span className="text-xs text-gris-400">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="pb-10 space-y-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/registro')}
            className="btn-secondary"
          >
            Crear cuenta nueva
          </button>
        </div>
      </div>
    </div>
  )
}
