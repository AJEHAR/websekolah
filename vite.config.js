import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PENTING: Tukar 'nama-repo-github-anda' kepada nama repo GitHub sebenar
// Contoh: jika repo anda https://github.com/username/skpk-website
// maka base perlu jadi '/skpk-website/'
export default defineConfig({
  plugins: [react()],
  base: '/nama-repo-github-anda/',
})
