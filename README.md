# Web Generador CV

Generador de currículum vitae en PDF con formulario web en 4 pasos.

## Stack

- **Frontend**: React 18 + Vite 5 + TailwindCSS
- **Backend**: Express 5 + Multer + PDFKit
- **Iconos**: Material Symbols (Google Fonts)
- **Canvas**: Partículas animadas de fondo

## Requisitos

- Node.js >= 18

## Instalación

```bash
npm install
cd server && npm install
```

## Desarrollo

Dos terminales:

```bash
# Terminal 1 - Frontend (Vite dev server, http://localhost:5173)
npm run dev

# Terminal 2 - Backend (Express API, http://localhost:3001)
npm run dev:server
```

Vite proxy `/api` a `localhost:3001`.

## Producción

```bash
npm run build
npm run start:server
```

Sirve los archivos estáticos de `dist/` desde Express en el puerto 3001.

## Estructura

```
cv-web/
├── src/                    # Frontend React
│   ├── App.jsx             # Wizard de 4 pasos + lógica principal
│   ├── ParticleBackground.jsx
│   ├── index.css           # Tailwind + animaciones
│   └── main.jsx
├── server/                 # Backend Express
│   ├── index.js            # API /api/generate-cv
│   ├── renderer.js         # Generación PDF con PDFKit
│   ├── components.js       # Componentes del PDF (panel, secciones)
│   ├── i18n.js             # Traducciones es/ca/en
│   ├── default.js          # Tema (colores, fuentes, márgenes)
│   ├── uploads/            # Fotos subidas temporalmente
│   └── output/             # PDFs generados temporalmente
├── index.html
├── vite.config.js
└── package.json
```

