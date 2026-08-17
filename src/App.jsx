import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ButangTerapung from './components/ButangTerapung.jsx'
import Home from './pages/Home.jsx'
import Galeri from './pages/Galeri.jsx'
import Hubungi from './pages/Hubungi.jsx'
import Profile from './pages/Profile/Profile.jsx'
import SenaraiKeberadaanSaya from './pages/Profile/SenaraiKeberadaanSaya.jsx'
import KeberadaanLayout from './pages/Keberadaan/KeberadaanLayout.jsx'
import KeberadaanHub from './pages/Keberadaan/KeberadaanHub.jsx'
import Daftar from './pages/Keberadaan/Daftar.jsx'
import HariIni from './pages/Keberadaan/HariIni.jsx'
import Esok from './pages/Keberadaan/Esok.jsx'
import Log from './pages/Keberadaan/Log.jsx'
import BeritaLayout from './pages/Berita/BeritaLayout.jsx'
import BeritaList from './pages/Berita/BeritaList.jsx'
import BeritaDetail from './pages/Berita/BeritaDetail.jsx'
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import AdminHub from './pages/Admin/AdminHub.jsx'
import StaffPage from './pages/Admin/StaffPage.jsx'
import MenungguPage from './pages/Admin/MenungguPage.jsx'
import SenaraiSekatanPage from './pages/Admin/SenaraiSekatanPage.jsx'
import PentadbirPage from './pages/Admin/PentadbirPage.jsx'
import Blok3KPage from './pages/Admin/Blok3KPage.jsx'
import LajurMuridPage from './pages/Admin/LajurMuridPage.jsx'
import KategoriUBKSPage from './pages/Admin/KategoriUBKSPage.jsx'
import PanitiaRPTPage from './pages/Admin/PanitiaRPTPage.jsx'
import KategoriRPTPage from './pages/Admin/KategoriRPTPage.jsx'
import LatarHubPage from './pages/Admin/LatarHubPage.jsx'
import ImportLaporanPerhimpunanPage from './pages/Admin/ImportLaporanPerhimpunanPage.jsx'
import ResetDataPage from './pages/Admin/ResetDataPage.jsx'
import GuruBertugasLayout from './pages/GuruBertugas/GuruBertugasLayout.jsx'
import GuruBertugasHub from './pages/GuruBertugas/GuruBertugasHub.jsx'
import Kumpulan from './pages/GuruBertugas/Kumpulan.jsx'
import Laporan3K from './pages/GuruBertugas/Laporan3K.jsx'
import LaporanBanci from './pages/GuruBertugas/LaporanBanci.jsx'
import LaporanHarian from './pages/GuruBertugas/LaporanHarian.jsx'
import LaporanPerhimpunan from './pages/GuruBertugas/LaporanPerhimpunan.jsx'
import MaklumatMuridLayout from './pages/MaklumatMurid/MaklumatMuridLayout.jsx'
import MaklumatMuridHub from './pages/MaklumatMurid/MaklumatMuridHub.jsx'
import DaftarMasuk from './pages/MaklumatMurid/DaftarMasuk.jsx'
import DaftarKeluar from './pages/MaklumatMurid/DaftarKeluar.jsx'
import SemakanMurid from './pages/MaklumatMurid/SemakanMurid.jsx'
import Analisis from './pages/MaklumatMurid/Analisis.jsx'
import KehadiranMurid from './pages/MaklumatMurid/KehadiranMurid.jsx'
import KehadiranRMT from './pages/MaklumatMurid/PapanRMT.jsx'
import EUBKSLayout from './pages/EUBKS/EUBKSLayout.jsx'
import EUBKSHub from './pages/EUBKS/EUBKSHub.jsx'
import MuridUBKS from './pages/EUBKS/MuridUBKS.jsx'
import KehadiranUBKS from './pages/EUBKS/KehadiranUBKS.jsx'
import LaporanUBKS from './pages/EUBKS/LaporanUBKS.jsx'
import PerancanganUBKS from './pages/EUBKS/PerancanganUBKS.jsx'
import KurikulumLayout from './pages/Kurikulum/KurikulumLayout.jsx'
import KurikulumHub from './pages/Kurikulum/KurikulumHub.jsx'
import BorangPLC from './pages/Kurikulum/BorangPLC.jsx'
import RPI from './pages/Kurikulum/RPI.jsx'
import RPT from './pages/Kurikulum/RPT.jsx'
import TemplateKertasKerja from './pages/Kurikulum/TemplateKertasKerja.jsx'
import KoleksiPekeliling from './pages/Kurikulum/KoleksiPekeliling.jsx'
import OPR from './pages/Kurikulum/OPR.jsx'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { useAksesStatus } from './hooks/useAksesStatus.js'

// Kawal akaun yang belum LENGKAP diluluskan - dua kes:
// 1. 'belum-profile' (staff kali pertama log masuk, tak ada profile
//    lagi) - paksa ke /profil supaya isi borang wajib.
// 2. 'menunggu' (dah isi profile, tapi admin belum luluskan) - hadkan
//    ke Utama ('/') + Profil sahaja. Sebelum ni staff status 'menunggu'
//    masih boleh nampak PENUH struktur menu (nama semua seksyen/sub-
//    halaman dalaman) walaupun data sendiri disekat oleh AksesGate/
//    Firestore rules - bukan kebocoran data, tapi tak selaras dengan
//    dasar "tak nampak apa-apa sehingga admin sahkan". Redirect terus
//    ke Utama lebih bersih berbanding skrin "Menunggu Kelulusan" bagi
//    setiap seksyen satu-satu.
// Admin (status='admin' dari useAksesStatus, walaupun profile sendiri
// belum 'diluluskan') TIDAK terjejas peraturan ni - admin ditentukan
// berasingan daripada aliran kelulusan profile staff.
// Laluan yang tetap terbuka kepada SESIAPA sahaja (tak kira log masuk ke
// tidak) - Utama + kandungan awam (Berita/Galeri/Hubungi, walaupun tak
// dipautkan dalam nav sekarang, URL tu masih patut boleh dicapai terus).
const LALUAN_AWAM = ['/', '/galeri', '/hubungi']
function adalahLaluanAwam(pathname) {
  return LALUAN_AWAM.includes(pathname) || pathname.startsWith('/berita')
}

function PenggeraAksesTerhad({ children }) {
  const { user } = useAuth()
  const { status, loading } = useAksesStatus(user)
  const location = useLocation()

  // Pengunjung belum log masuk LANGSUNG (bukan status "menunggu" - itu
  // staff yang DAH log masuk tapi belum lulus, kes lain) - hadkan ke
  // laluan awam sahaja. Elak dia "jumpa" page dalaman (walaupun cuma
  // nampak skrin "sila log masuk", bukan data sebenar) sekadar dengan
  // taip/ikut URL terus - selaras dengan nav yang dah sorok nama page
  // tu (Navbar.jsx) supaya pengalaman konsisten merentasi kedua-dua.
  if (!user) {
    if (!adalahLaluanAwam(location.pathname)) {
      return <Navigate to="/" replace />
    }
    return children
  }

  if (loading) return children

  if (status === 'belum-profile' && location.pathname !== '/profil') {
    return <Navigate to="/profil" replace />
  }

  if ((status === 'menunggu' || status === 'disekat') && location.pathname !== '/' && location.pathname !== '/profil') {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <div className="min-h-dvh flex flex-col bg-base">
      <Navbar />
      <div className="flex-1">
        <PenggeraAksesTerhad>
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
            <Route index element={<KeberadaanHub />} />
            <Route path="daftar" element={<Daftar />} />
            <Route path="hari-ini" element={<HariIni />} />
            <Route path="esok" element={<Esok />} />
            <Route path="log" element={<Log />} />
            <Route path="saya" element={<SenaraiKeberadaanSaya />} />
          </Route>

          {/* Panel Admin - tab pills (Staff/Menunggu Kelulusan/Pentadbir) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHub />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="menunggu" element={<MenungguPage />} />
            <Route path="sekatan" element={<SenaraiSekatanPage />} />
            <Route path="pentadbir" element={<PentadbirPage />} />
            <Route path="blok3k" element={<Blok3KPage />} />
            <Route path="lajur-murid" element={<LajurMuridPage />} />
            <Route path="kategori-ubks" element={<KategoriUBKSPage />} />
            <Route path="panitia-rpt" element={<PanitiaRPTPage />} />
            <Route path="kategori-rpt" element={<KategoriRPTPage />} />
            <Route path="latar-hub" element={<LatarHubPage />} />
            <Route path="import-perhimpunan" element={<ImportLaporanPerhimpunanPage />} />
            <Route path="reset-data" element={<ResetDataPage />} />
          </Route>

          {/* Guru Bertugas - tab pills (Kumpulan/Laporan 3K/Laporan Banci/Laporan Harian) */}
          <Route path="/guru-bertugas" element={<GuruBertugasLayout />}>
            <Route index element={<GuruBertugasHub />} />
            <Route path="kumpulan" element={<Kumpulan />} />
            <Route path="3k" element={<Laporan3K />} />
            <Route path="banci" element={<LaporanBanci />} />
            <Route path="harian" element={<LaporanHarian />} />
            <Route path="perhimpunan" element={<LaporanPerhimpunan />} />
          </Route>

          {/* HEM - Daftar Masuk/Keluar, Maklumat Asas, Kehadiran
              Murid & RMT (dulu seksyen berasingan "eBanci" - digabung sini
              sebab sama-sama kerja guru kelas berkaitan rekod murid, bukan
              tugas guru bertugas - lihat Laporan Banci di bawah Guru
              Bertugas untuk peranan yang berbeza: pemantauan merentas kelas) */}
          <Route path="/maklumat-murid" element={<MaklumatMuridLayout />}>
            <Route index element={<MaklumatMuridHub />} />
            <Route path="analisis" element={<Analisis />} />
            <Route path="semakan" element={<SemakanMurid />} />
            <Route path="daftar-masuk" element={<DaftarMasuk />} />
            <Route path="daftar-keluar" element={<DaftarKeluar />} />
            <Route path="kehadiran-murid" element={<KehadiranMurid />} />
            <Route path="kehadiran-rmt" element={<KehadiranRMT />} />
          </Route>

          {/* URL lama "/ebanci/*" (seksyen dah digabung ke HEM) -
              redirect supaya pautan/bookmark sedia ada staff tak terus mati. */}
          <Route path="/ebanci" element={<Navigate to="/maklumat-murid" replace />} />
          <Route path="/ebanci/kehadiran-murid" element={<Navigate to="/maklumat-murid/kehadiran-murid" replace />} />
          <Route path="/ebanci/papan-rmt" element={<Navigate to="/maklumat-murid/kehadiran-rmt" replace />} />

          {/* KOKU - hub dengan akses pantas, + 4 sub-page */}
          <Route path="/eubks" element={<EUBKSLayout />}>
            <Route index element={<EUBKSHub />} />
            <Route path="murid-ubks" element={<MuridUBKS />} />
            <Route path="kehadiran-ubks" element={<KehadiranUBKS />} />
            <Route path="laporan-ubks" element={<LaporanUBKS />} />
            <Route path="perancangan-ubks" element={<PerancanganUBKS />} />
          </Route>

          {/* KURI - hub dengan akses pantas, + sub-page (pengisian ditambah kemudian) */}
          <Route path="/kurikulum" element={<KurikulumLayout />}>
            <Route index element={<KurikulumHub />} />
            <Route path="borang-plc" element={<BorangPLC />} />
            <Route path="rpi" element={<RPI />} />
            <Route path="rpt" element={<RPT />} />
            <Route path="template-kertas-kerja" element={<TemplateKertasKerja />} />
            <Route path="koleksi-pekeliling" element={<KoleksiPekeliling />} />
            <Route path="opr" element={<OPR />} />
          </Route>

          {/* Tambah <Route> baru di sini setiap kali page/sub-page baru dibina */}
        </Routes>
        </PenggeraAksesTerhad>
      </div>
      {user && <ButangTerapung />}
    </div>
  )
}
