import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
],
})

// vite.config.js
tailwindcss({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
})