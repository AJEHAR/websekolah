import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { DialogProvider } from './context/DialogContext.jsx'
import { AdminModeProvider } from './context/AdminModeContext.jsx'
import App from './App.jsx'
import './index.css'

// Auto muat-semula bila chunk lama dah lapuk (404) - berlaku bila tab
// staff dah terbuka SEBELUM satu deploy baharu (kod code-split dgn
// lazy()/import() ikut nama fail berhash - Vite/rollup tukar nama SETIAP
// deploy). Fail lama tu dah dibuang server, tapi shell app (index.html)
// yang dimuat dalam tab tu ROSAK sebab masih rujuk nama fail LAMA -
// Vite lancarkan event "vite:preloadError" bila ni berlaku. Auto reload
// (sekali sahaja - guna sessionStorage elak infinite-loop kalau server
// betul-betul down) supaya staff terus dapat shell TERKINI tanpa perlu
// faham sebab teknikal "kenapa page rosak tiba-tiba".
window.addEventListener('vite:preloadError', () => {
  const kunci = 'kkgs_reload_lepas_preload_error'
  if (sessionStorage.getItem(kunci)) return // dah cuba reload sekali, jangan gelung selama-lamanya
  sessionStorage.setItem(kunci, '1')
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DialogProvider>
        <AuthProvider>
          <AdminModeProvider>
            <App />
          </AdminModeProvider>
        </AuthProvider>
      </DialogProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// App dah berjaya muat (shell utama okay) - buang penanda "dah cuba
// reload" lepas seketika, supaya kalau deploy BAHARU LAGI berlaku
// semasa tab ni masih terbuka, mekanisme auto-reload di atas boleh
// tercetus SEKALI LAGI (bukan disekat selama-lamanya oleh percubaan
// reload yang lama).
setTimeout(() => {
  try { sessionStorage.removeItem('kkgs_reload_lepas_preload_error') } catch { /* selamat diabaikan */ }
}, 5000)
