import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BottomTabBar from './components/BottomTabBar.jsx'
import Home from './pages/Home.jsx'
import Galeri from './pages/Galeri.jsx'
import Hubungi from './pages/Hubungi.jsx'
import Profile from './pages/Profile/Profile.jsx'
import SenaraiKeberadaanSaya from './pages/Profile/SenaraiKeberadaanSaya.jsx'
import Keberadaan from './pages/Keberadaan/Keberadaan.jsx'
import BeritaLayout from './pages/Berita/BeritaLayout.jsx'
import BeritaList from './pages/Berita/BeritaList.jsx'
import BeritaDetail from './pages/Berita/BeritaDetail.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Navbar />
      {/* pb-20 elak kandungan tertutup bottom tab bar pada mobile */}
      <div className="flex-1 pb-20 lg:pb-0">
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
          <Route path="/keberadaan" element={<Keberadaan />} />

          {/* Tambah <Route> baru di sini setiap kali page/sub-page baru dibina */}
        </Routes>
      </div>
      <Footer />
      <BottomTabBar />
    </div>
  )
}
