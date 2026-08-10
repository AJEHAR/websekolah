import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Galeri from './pages/Galeri.jsx'
import Hubungi from './pages/Hubungi.jsx'
import Profile from './pages/Profile/Profile.jsx'
import SenaraiKeberadaanSaya from './pages/Profile/SenaraiKeberadaanSaya.jsx'
import KeberadaanLayout from './pages/Keberadaan/KeberadaanLayout.jsx'
import HariIni from './pages/Keberadaan/HariIni.jsx'
import Esok from './pages/Keberadaan/Esok.jsx'
import Log from './pages/Keberadaan/Log.jsx'
import BeritaLayout from './pages/Berita/BeritaLayout.jsx'
import BeritaList from './pages/Berita/BeritaList.jsx'
import BeritaDetail from './pages/Berita/BeritaDetail.jsx'
import Admin from './pages/Admin/Admin.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Seksyen Berita - contoh nested route (induk + sub-page dinamik) */}
          <Route path="/berita" element={<BeritaLayout />}>
            <Route index element={<BeritaList />} />
            <Route path=":slug" element={<BeritaDetail />} />
          </Route>

          <Route path="/galeri" element={<Galeri />} />
          <Route path="/hubungi" element={<Hubungi />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profil/kehadiran" element={<SenaraiKeberadaanSaya />} />

          {/* Keberadaan - tab pills (Hari Ini/Esok/Log) dalam satu layout */}
          <Route path="/keberadaan" element={<KeberadaanLayout />}>
            <Route index element={<Navigate to="hari-ini" replace />} />
            <Route path="hari-ini" element={<HariIni />} />
            <Route path="esok" element={<Esok />} />
            <Route path="log" element={<Log />} />
          </Route>

          <Route path="/admin" element={<Admin />} />

          {/* Tambah <Route> baru di sini setiap kali page/sub-page baru dibina */}
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
