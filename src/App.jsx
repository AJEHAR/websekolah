import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ButangTerapung from './components/ButangTerapung.jsx'
import Home from './pages/Home.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useAksesStatus } from './hooks/useAksesStatus.js'

// PENTING - code-splitting: sebelum ni SEMUA ~60 page dimuat serentak
// dalam SATU fail JS (bundle dah cecah 1.6MB) - punca app rasa perlahan
// terutama pada peranti kurang berkuasa/rangkaian perlahan (iPad dsb),
// sebab keseluruhan fail tu kena muat turun+parse+jalankan SEBELUM apa-apa
// pun boleh dipaparkan, walaupun staff cuma nak buka SATU page je. Guna
// lazy() - setiap page jadi fail JS berasingan, dimuat turun HANYA bila
// staff benar-benar navigate ke situ. Navbar/Home/ButangTerapung kekal
// dimuat terus (kecil, perlu untuk paparan pertama).
const Galeri = lazy(() => import('./pages/Galeri.jsx'))
const Hubungi = lazy(() => import('./pages/Hubungi.jsx'))
const TetapanHubungiPage = lazy(() => import('./pages/TetapanHubungiPage.jsx'))
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'))
const SenaraiKeberadaanSaya = lazy(() => import('./pages/Profile/SenaraiKeberadaanSaya.jsx'))
const KeberadaanLayout = lazy(() => import('./pages/Keberadaan/KeberadaanLayout.jsx'))
const KeberadaanHub = lazy(() => import('./pages/Keberadaan/KeberadaanHub.jsx'))
const Daftar = lazy(() => import('./pages/Keberadaan/Daftar.jsx'))
const HariIni = lazy(() => import('./pages/Keberadaan/HariIni.jsx'))
const Esok = lazy(() => import('./pages/Keberadaan/Esok.jsx'))
const Log = lazy(() => import('./pages/Keberadaan/Log.jsx'))
const BeritaLayout = lazy(() => import('./pages/Berita/BeritaLayout.jsx'))
const BeritaList = lazy(() => import('./pages/Berita/BeritaList.jsx'))
const BeritaDetail = lazy(() => import('./pages/Berita/BeritaDetail.jsx'))
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout.jsx'))
const AdminHub = lazy(() => import('./pages/Admin/AdminHub.jsx'))
const StafAdminPage = lazy(() => import('./pages/Admin/StafAdminPage.jsx'))
const SenaraiSekatanPage = lazy(() => import('./pages/Admin/SenaraiSekatanPage.jsx'))
const Blok3KPage = lazy(() => import('./pages/Admin/Blok3KPage.jsx'))
const LajurMuridPage = lazy(() => import('./pages/Admin/LajurMuridPage.jsx'))
const KategoriUBKSPage = lazy(() => import('./pages/Admin/KategoriUBKSPage.jsx'))
const PanitiaRPTPage = lazy(() => import('./pages/Admin/PanitiaRPTPage.jsx'))
const KategoriRPTPage = lazy(() => import('./pages/Admin/KategoriRPTPage.jsx'))
const LatarHubPage = lazy(() => import('./pages/Admin/LatarHubPage.jsx'))
const ResetDataPage = lazy(() => import('./pages/Admin/ResetDataPage.jsx'))
const GuruBertugasLayout = lazy(() => import('./pages/GuruBertugas/GuruBertugasLayout.jsx'))
const GuruBertugasHub = lazy(() => import('./pages/GuruBertugas/GuruBertugasHub.jsx'))
const Kumpulan = lazy(() => import('./pages/GuruBertugas/Kumpulan.jsx'))
const Laporan3K = lazy(() => import('./pages/GuruBertugas/Laporan3K.jsx'))
const LaporanBanci = lazy(() => import('./pages/GuruBertugas/LaporanBanci.jsx'))
const LaporanHarian = lazy(() => import('./pages/GuruBertugas/LaporanHarian.jsx'))
const LaporanPerhimpunan = lazy(() => import('./pages/GuruBertugas/LaporanPerhimpunan.jsx'))
const MaklumatMuridLayout = lazy(() => import('./pages/MaklumatMurid/MaklumatMuridLayout.jsx'))
const MaklumatMuridHub = lazy(() => import('./pages/MaklumatMurid/MaklumatMuridHub.jsx'))
const DaftarMasuk = lazy(() => import('./pages/MaklumatMurid/DaftarMasuk.jsx'))
const DaftarKeluar = lazy(() => import('./pages/MaklumatMurid/DaftarKeluar.jsx'))
const SemakanMurid = lazy(() => import('./pages/MaklumatMurid/SemakanMurid.jsx'))
const Analisis = lazy(() => import('./pages/MaklumatMurid/Analisis.jsx'))
const KehadiranMurid = lazy(() => import('./pages/MaklumatMurid/KehadiranMurid.jsx'))
const KehadiranRMT = lazy(() => import('./pages/MaklumatMurid/PapanRMT.jsx'))
const EUBKSLayout = lazy(() => import('./pages/EUBKS/EUBKSLayout.jsx'))
const EUBKSHub = lazy(() => import('./pages/EUBKS/EUBKSHub.jsx'))
const MuridUBKS = lazy(() => import('./pages/EUBKS/MuridUBKS.jsx'))
const UnitUBKSDetail = lazy(() => import('./pages/EUBKS/UnitUBKSDetail.jsx'))
const ProfilMuridUBKS = lazy(() => import('./pages/EUBKS/ProfilMuridUBKS.jsx'))
const JawatankuasaUBKS = lazy(() => import('./pages/EUBKS/JawatankuasaUBKS.jsx'))
const KehadiranUBKS = lazy(() => import('./pages/EUBKS/KehadiranUBKS.jsx'))
const LaporanUBKS = lazy(() => import('./pages/EUBKS/LaporanUBKS.jsx'))
const LaporanUBKSDetail = lazy(() => import('./pages/EUBKS/LaporanUBKSDetail.jsx'))
const FailUnit = lazy(() => import('./pages/EUBKS/FailUnit.jsx'))
const PerancanganUBKS = lazy(() => import('./pages/EUBKS/PerancanganUBKS.jsx'))
const KurikulumLayout = lazy(() => import('./pages/Kurikulum/KurikulumLayout.jsx'))
const KurikulumHub = lazy(() => import('./pages/Kurikulum/KurikulumHub.jsx'))
const BorangPLC = lazy(() => import('./pages/Kurikulum/BorangPLC.jsx'))
const RPI = lazy(() => import('./pages/Kurikulum/RPI.jsx'))
const RPT = lazy(() => import('./pages/Kurikulum/RPT.jsx'))
const TemplateKertasKerja = lazy(() => import('./pages/Kurikulum/TemplateKertasKerja.jsx'))
const OPPM = lazy(() => import('./pages/Kurikulum/OPPM.jsx'))
const OPPMDetail = lazy(() => import('./pages/Kurikulum/OPPMDetail.jsx'))
const SuratSpi = lazy(() => import('./components/SuratSpi.jsx'))
const OPR = lazy(() => import('./pages/Kurikulum/OPR.jsx'))

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
// dipautkan dalam nav sekarang, URL tu masih patut boleh dicapai terus) +
// /profil (papar skrin Log Masuk/Daftar sahaja untuk pengunjung belum log
// masuk - lihat Profile.jsx, TIADA data sebenar terdedah, sifar Firestore
// read - jadi selamat jadi destinasi butang Log Masuk/Daftar di Navbar).
const LALUAN_AWAM = ['/', '/galeri', '/hubungi', '/profil']
function adalahLaluanAwam(pathname) {
  return LALUAN_AWAM.includes(pathname) || pathname.startsWith('/berita')
}

function PenggeraAksesTerhad({ children }) {
  const { user } = useAuth()
  const { status, loading } = useAksesStatus(user)
  const location = useLocation()

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

// Ditunjuk sekejap semasa fail page (chunk) sedang dimuat turun - biasanya
// kekal <1 saat pada rangkaian sekolah biasa (setiap page kecil selepas
// dipecah), tapi tetap perlu supaya skrin tak kosong sekejap.
function MemuatkanPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 border-2 border-border border-t-brand-red rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <div className="min-h-dvh flex flex-col bg-base">
      <Navbar />
      <div className="flex-1">
        <PenggeraAksesTerhad>
        <Suspense fallback={<MemuatkanPage />}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/berita" element={<BeritaLayout />}>
            <Route index element={<BeritaList />} />
            <Route path=":slug" element={<BeritaDetail />} />
          </Route>
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/hubungi" element={<Hubungi />} />
          <Route path="/hubungi/tetapan" element={<TetapanHubungiPage />} />

          <Route path="/profil" element={<Profile />} />

          <Route path="/keberadaan" element={<KeberadaanLayout />}>
            <Route index element={<KeberadaanHub />} />
            <Route path="daftar" element={<Daftar />} />
            <Route path="hari-ini" element={<HariIni />} />
            <Route path="esok" element={<Esok />} />
            <Route path="log" element={<Log />} />
            <Route path="saya" element={<SenaraiKeberadaanSaya />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHub />} />
            <Route path="staff" element={<StafAdminPage />} />
            <Route path="menunggu" element={<Navigate to="/admin/staff" replace />} />
            <Route path="sekatan" element={<SenaraiSekatanPage />} />
            <Route path="pentadbir" element={<Navigate to="/admin/staff" replace />} />
            <Route path="blok3k" element={<Blok3KPage />} />
            <Route path="lajur-murid" element={<LajurMuridPage />} />
            <Route path="kategori-ubks" element={<KategoriUBKSPage />} />
            <Route path="panitia-rpt" element={<PanitiaRPTPage />} />
            <Route path="kategori-rpt" element={<KategoriRPTPage />} />
            <Route path="latar-hub" element={<LatarHubPage />} />
            <Route path="reset-data" element={<ResetDataPage />} />
          </Route>

          <Route path="/guru-bertugas" element={<GuruBertugasLayout />}>
            <Route index element={<GuruBertugasHub />} />
            <Route path="kumpulan" element={<Kumpulan />} />
            <Route path="3k" element={<Laporan3K />} />
            <Route path="banci" element={<LaporanBanci />} />
            <Route path="harian" element={<LaporanHarian />} />
            <Route path="perhimpunan" element={<LaporanPerhimpunan />} />
          </Route>

          <Route path="/maklumat-murid" element={<MaklumatMuridLayout />}>
            <Route index element={<MaklumatMuridHub />} />
            <Route path="analisis" element={<Analisis />} />
            <Route path="semakan" element={<SemakanMurid />} />
            <Route path="daftar-masuk" element={<DaftarMasuk />} />
            <Route path="daftar-keluar" element={<DaftarKeluar />} />
            <Route path="kehadiran-murid" element={<KehadiranMurid />} />
            <Route path="kehadiran-rmt" element={<KehadiranRMT />} />
            <Route path="surat-spi" element={<SuratSpi seksyen="hem" />} />
            <Route path="opr" element={<OPR seksyen="hem" />} />
          </Route>

          <Route path="/ebanci" element={<Navigate to="/maklumat-murid" replace />} />
          <Route path="/ebanci/kehadiran-murid" element={<Navigate to="/maklumat-murid/kehadiran-murid" replace />} />
          <Route path="/ebanci/papan-rmt" element={<Navigate to="/maklumat-murid/kehadiran-rmt" replace />} />

          <Route path="/eubks" element={<EUBKSLayout />}>
            <Route index element={<EUBKSHub />} />
            <Route path="murid-ubks" element={<MuridUBKS />} />
            <Route path="murid-ubks/:unitId" element={<UnitUBKSDetail />} />
            <Route path="profil-murid" element={<ProfilMuridUBKS />} />
            <Route path="jawatankuasa-ubks" element={<JawatankuasaUBKS />} />
            <Route path="kehadiran-ubks" element={<KehadiranUBKS />} />
            <Route path="laporan-ubks" element={<LaporanUBKS />} />
            <Route path="laporan-ubks/:unitId/:perjumpaan" element={<LaporanUBKSDetail />} />
            <Route path="fail-unit/:unitId" element={<FailUnit />} />
            <Route path="perancangan-ubks" element={<PerancanganUBKS />} />
            <Route path="opr" element={<OPR seksyen="koku" />} />
            <Route path="surat-spi" element={<SuratSpi seksyen="koku" />} />
          </Route>

          <Route path="/kurikulum" element={<KurikulumLayout />}>
            <Route index element={<KurikulumHub />} />
            <Route path="borang-plc" element={<BorangPLC />} />
            <Route path="rpi" element={<RPI />} />
            <Route path="rpt" element={<RPT />} />
            <Route path="template-kertas-kerja" element={<TemplateKertasKerja />} />
            <Route path="oppm" element={<OPPM />} />
            <Route path="oppm/:id" element={<OPPMDetail />} />
            <Route path="surat-spi" element={<SuratSpi seksyen="kurikulum" />} />
            <Route path="koleksi-pekeliling" element={<Navigate to="/kurikulum/surat-spi" replace />} />
            <Route path="opr" element={<OPR seksyen="kurikulum" />} />
          </Route>

          {/* Tambah <Route> baru di sini setiap kali page/sub-page baru dibina */}
        </Routes>
        </Suspense>
        </PenggeraAksesTerhad>
      </div>
      {user && <ButangTerapung />}
    </div>
  )
}
