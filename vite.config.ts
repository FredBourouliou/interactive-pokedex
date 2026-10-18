import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// `base` matches the GitHub Pages project path (https://<user>.github.io/interactive-pokedex/).
export default defineConfig({
  plugins: [react()],
  base: '/interactive-pokedex/',
})
