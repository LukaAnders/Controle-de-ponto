import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Usa "/" na Vercel (ou dev local) e "/Controle-de-ponto/" no GitHub Pages
  base: process.env.VERCEL ? "/" : "/Controle-de-ponto/",
  plugins: [react()],
});
