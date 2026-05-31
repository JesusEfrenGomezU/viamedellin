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


### 1. Clonar / descomprimir y entrar al directorio

```bash
cd viamedellin
```

### 2. Instalar dependencias

```bash
npm install
```

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

-  Registro e inicio de sesión 
-  Perfil de usuario (nombre, apellido)
-  Mapa de Medellín 
-  Filtros por estado: Urgente / Pendiente / Resuelto
-  Panel lateral en PC, drawer en móvil
-  Formulario de reporte con mapa 
-  Geolocalización automática
-  Subida de fotos al Storage de Supabase
-  Totalmente responsivo
-  Indicador de fuerza de contraseña

