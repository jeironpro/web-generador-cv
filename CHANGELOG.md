# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

## [1.0.0] - 2026-06-23

### Añadido
- Backend API con Express.js (rutas para servir frontend y `/api/generate-cv`)
- Generación de PDFs con PDFKit (diseño de dos columnas, recorte circular de foto)
- Subida de fotos multipart con Multer
- Soporte multilenguaje (español, catalán, inglés)
- Frontend React con Vite (asistente de 4 pasos para crear CV)
- Estilos con Tailwind CSS y componentes Glassmorphism
- Iconos Material Symbols (Google Fonts)
- Fondo animado de partículas con Canvas API
- Validación de nombre obligatorio y envío de datos en JSON / FormData
- Descarga de PDFs como blob para múltiples idiomas a la vez
- Scripts NPM: `dev` (Vite), `dev:server` (Express) y `build`
- API proxy de Vite para desarrollo (`/api` → `localhost:3001`)
- Fallback SPA para React Router (sendFile a index.html)
