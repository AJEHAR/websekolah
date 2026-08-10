import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
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
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import StaffPage from './pages/Admin/StaffPage.jsx'
import MenungguPage from './pages/Admin/MenungguPage.jsx'
import PentadbirPage from './pages/Admin/PentadbirPage.jsx'
import Blok3KPage from './pages/Admin/Blok3KPage.jsx'
import GuruBertugasLayout from './pages/GuruBertugas/GuruBertugasLayout.jsx'
import Kumpulan from './pages/GuruBertugas/Kumpulan.jsx'
import Laporan3K from './pages/GuruBertugas/Laporan3K.jsx'
import LaporanBanci from './pages/GuruBertugas/LaporanBanci.jsx'
import LaporanHarian from './pages/GuruBertugas/LaporanHarian.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Berita/Galeri/Hubungi: route kekal (tak dipadam), cuma dibuang dari nav.
              Boleh diakses terus via URL kalau perlu, atau padam terus kalau tak diperlukan lagi. */}
          <Route path="/berita" element={<BeritaLayout />}>
            <Route index element={<BeritaList />} />
            <Route path=":slug" element={<BeritaDetail />} />
          </Route>
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/hubungi" element={<Hubungi />} />

          <Route path="/profil" element={<Profile />} />

          {/* Keberadaan - tab pills (Hari Ini/Esok/Log/Saya) dalam satu layout */}
          <Route path="/keberadaan" element={<KeberadaanLayout />}>
            <Route index element={<Navigate to="hari-ini" replace />} />
            <Route path="hari-ini" element={<HariIni />} />
            <Route path="esok" element={<Esok />} />
            <Route path="log" element={<Log />} />
            <Route path="saya" element={<SenaraiKeberadaanSaya />} />
          </Route>

          {/* Panel Admin - tab pills (Staff/Menunggu Kelulusan/Pentadbir) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="staff" replace />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="menunggu" element={<MenungguPage />} />
            <Route path="pentadbir" element={<PentadbirPage />} />
            <Route path="blok3k" element={<Blok3KPage />} />
          </Route>

          {/* Guru Bertugas - tab pills (Kumpulan/Laporan 3K/Laporan Banci/Laporan Harian) */}
          <Route path="/guru-bertugas" element={<GuruBertugasLayout />}>
            <Route index element={<Navigate to="kumpulan" replace />} />
            <Route path="kumpulan" element={<Kumpulan />} />
            <Route path="3k" element={<Laporan3K />} />
            <Route path="banci" element={<LaporanBanci />} />
            <Route path="harian" element={<LaporanHarian />} />
          </Route>

          {/* Tambah <Route> baru di sini setiap kali page/sub-page baru dibina */}
        </Routes>
      </div>
    </div>
  )
}
