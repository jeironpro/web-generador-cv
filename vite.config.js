// Importaciones de Vite y plugins
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Plugins: React Fast Refresh + Tailwind CSS v4
  plugins: [react(), tailwindcss()]
})
