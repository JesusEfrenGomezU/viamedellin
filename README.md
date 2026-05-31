# VíaMedellín 🗺️

Plataforma web responsiva para reportar y visualizar daños viales en Medellín.
Construida con **React + Vite + Tailwind CSS + Supabase + Leaflet**.

## Pantallas

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Bienvenida | `/` | Landing con stats y botones de acceso |
| Iniciar sesión | `/login` | Autenticación por correo y contraseña |
| Registro | `/registro` | Crear cuenta nueva |
| Mapa | `/mapa` | Vista de todos los reportes con filtros |
| Reportar | `/reportar` | Formulario + mapa draggable para nuevo reporte |

## Pasos para configurar

### 1. Clonar / descomprimir y entrar al directorio

```bash
cd viamedellin
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. En el SQL Editor, ejecuta el contenido de **`schema.sql`** (crea las tablas, RLS, trigger y bucket de fotos)
4. Copia tus credenciales desde **Settings → API**

### 4. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y rellena:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### 6. Build para producción

```bash
npm run build
npm run preview   # para probar el build localmente
```

## Deploy gratuito con Vercel

```bash
npm install -g vercel
vercel
```
Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el dashboard de Vercel.

## Estructura del proyecto

```
viamedellin/
├── public/
│   └── favicon.svg
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx      ← Sesión global (signIn, signUp, signOut)
│   ├── components/
│   │   └── ProtectedRoute.jsx   ← Redirección si no está autenticado
│   ├── lib/
│   │   └── supabase.js          ← Cliente + helper para fotos
│   ├── pages/
│   │   ├── Welcome.jsx          ← Pantalla de bienvenida
│   │   ├── Login.jsx            ← Inicio de sesión
│   │   ├── Register.jsx         ← Registro de usuario
│   │   ├── MapView.jsx          ← Mapa con reportes en tiempo real
│   │   └── ReportForm.jsx       ← Crear nuevo reporte
│   ├── App.jsx                  ← Router principal
│   ├── index.css                ← Tailwind + estilos de Leaflet
│   └── main.jsx                 ← Punto de entrada
├── schema.sql                   ← Script SQL para Supabase
├── .env.example                 ← Plantilla de variables de entorno
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Stack tecnológico

| Herramienta | Uso |
|------------|-----|
| React 18 | UI framework |
| Vite | Bundler / dev server |
| Tailwind CSS 3 | Estilos responsivos |
| Supabase | Base de datos, autenticación, almacenamiento |
| react-leaflet + Leaflet | Mapa interactivo |
| React Router v6 | Navegación entre páginas |
| Nominatim (OSM) | Geocodificación inversa gratuita |
| CartoDB Dark Tiles | Mapa oscuro sin key de API |

## Funcionalidades

- ✅ Registro e inicio de sesión (Supabase Auth)
- ✅ Perfil de usuario (nombre, apellido)
- ✅ Mapa de Medellín oscuro con marcadores de colores según estado
- ✅ Filtros por estado: Urgente / Pendiente / Resuelto
- ✅ Panel lateral en PC, drawer en móvil
- ✅ Actualización en tiempo real (Supabase Realtime)
- ✅ Formulario de reporte con mapa draggable
- ✅ Geolocalización automática (GPS del navegador)
- ✅ Geocodificación inversa (dirección a partir de coordenadas)
- ✅ Subida de fotos al Storage de Supabase
- ✅ Totalmente responsivo: móvil-first + layout de PC
- ✅ Animaciones y microinteracciones
- ✅ Indicador de fuerza de contraseña

## Notas

- El Storage de Supabase es **público** en este proyecto para simplificar. Para producción real, considera usar URLs firmadas.
- La geocodificación usa **Nominatim** (OpenStreetMap), que es gratuita pero tiene límite de 1 solicitud/segundo. Para mayor carga, considera Mapbox Geocoding o Google Geocoding API.
- Los reportes se ordenan por fecha de creación (más reciente primero).
