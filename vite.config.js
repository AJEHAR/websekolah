import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Guna custom domain (sekolah.syazr.com) - base kekal '/' sebab domain
// serve terus dari root, bukan dari sub-folder repo GitHub.
// Kalau nanti custom domain ditanggalkan dan balik guna default GitHub Pages
// URL (ajehar.github.io/websekolah/), tukar semula base kepada '/websekolah/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
