# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

## [2.0.0] - 2026-06-23

### Añadido
- **Despliegue en Cloudflare Pages** con Cloudflare Pages Functions
- Implementación de **función `/api/generate-cv`** estilo Pages Functions (reemplaza Express)
- **Generación de PDF en el edge** usando pdfkit (build browser/edge-compatible)
- Copia de módulos del servidor (`default.js`, `i18n.js`, `components.js`) a `functions/lib/` para uso en Functions
- Configuración de **Wrangler** (`wrangler.toml`) con `nodejs_compat` para compatibilidad Node.js en Workers
- Archivo `_redirects` para SPA fallback (todas las rutas apuntan a `index.html`)
- Eliminación de dependencia de servidor Express/Multer en despliegue producción (ahora es un static site + Functions)
- Compatibilidad con **desarrollo local** manteniendo `server/index.js` y proxy de Vite para `npm run dev`
- Instalación de dependencias necesarias: `pdfkit`, `lucide-static` para el entorno Functions
- Builder Vite actualizado automáticamente a `dist/` (estructura compatible Cloudflare Pages)
- Lógica de lectura de foto como `data:` URL en el cliente.

### Cambiado
- El endpoint `/api/generate-cv` ahora usa multipart parsing nativo de Cloudflare Functions en lugar de Multer
- El renderizador PDF acepta foto como `data:` URL (base64) generada desde bytes del upload
- Scripts de package.json: `dev`, `build`, `preview` permanecen; `dev:server` para desarrollo local
- Estructura de carpetas: `functions/api/` (funciones), `functions/lib/` (módulos del servidor)
- Generación de PDF trasladada al cliente usando **jsPDF** (`src/pdf-renderer.js`).
- `StepDownload` ahora genera PDFs en el navegador y descarga los blobs directamente.

### Eliminado
- Dependencia de un servidor independiente en producción (no se necesita correr Express aparte)
- Servidor Express del despliegue productivo (se reemplaza por Pages Functions)
- `functions/api/generate-cv.js` (Pages Function que utilizaba pdfkit).
- Dependencias innecesarias: `pdfkit`, `@napi-rs/canvas`, `mupdf`.

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

