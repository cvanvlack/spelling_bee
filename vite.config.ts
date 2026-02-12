import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: set base to your repo name, e.g. '/spelling_bee/'
const base = process.env.GITHUB_PAGES_BASE ?? (process.env.NODE_ENV === 'production' ? '/spelling_bee/' : '/')

export default defineConfig({
  plugins: [react()],
  base,
})
