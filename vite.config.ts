import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  // GitHub Pages hosts this project under /Controle-de-ponto/.
  base: "/Controle-de-ponto/",
  plugins: [react()],
})
