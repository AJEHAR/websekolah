import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleIcon from './GoogleIcon.jsx'

const GRADIEN_JENAMA = 'linear-gradient(160deg, #1A1A1A 0%, #4A0E16 55%, #C8102E 130%)'

const KANDUNGAN = {
  login: {
    lencana: 'Untuk Staff Sedia Ada',
    warnaLencana: { background: '#FCEBEB', color: '#C8102E' },
    tajuk: 'Selamat Kembali',
    butang: 'Log Masuk dengan Google',
    panel: {
      tajuk: 'Staff Baru?',
      teks: 'Belum ada akaun dalam sistem ni? Daftar dulu sebelum boleh akses.',
      togol: 'Daftar →',
    },
  },
  daftar: {
    lencana: 'Untuk Staff Baru',
    warnaLencana: { background: '#FBF3D9', color: '#8A6D00' },
    tajuk: 'Sertai Sistem',
    butang: 'Daftar dengan Google',
    panel: {
      tajuk: 'Dah Ada Akaun?',
      teks: 'Kalau anda staff sedia ada, terus log masuk tanpa perlu daftar semula.',
      togol: '← Log Masuk',
    },
  },
}

// Skrin log masuk/daftar kongsi - dipakai di Profile.jsx dan setiap Layout
// seksyen (Keberadaan, Guru Bertugas, HEM, KOKU, KURI) bila pengguna belum
// log masuk. Reka bentuk "2 mod kontras" (rujuk perbualan reka bentuk) -
// mobile guna tab suis di atas, desktop (sm:+) tambah panel warna jenama di
// sisi dengan butang togol sendiri. Kedua-dua cuma tukar `mod` state yang
// sama - bukan animasi geser CSS macam template asal (terlalu kompleks nak
// buat responsive dengan baik), tapi rasa kontras "2 pilihan" dikekalkan.
//
// namaHalaman: teks pendek untuk konteks (cth. "Keberadaan", "HEM") -
// dipaparkan dalam penerangan supaya staff tahu apa yang dia nak akses.
// pendaftaranDibuka: dari useTetapanPendaftaran() - kalau admin tutup
// pendaftaran awam, mod "daftar" & tab/panel togol terus disembunyikan,
// papar mod "login" sahaja (tiada apa-apa untuk togol kepada).
export default function AksesPrompt({ namaHalaman, pendaftaranDibuka = true }) {
  const { signInWithGoogle } = useAuth()
  const location = useLocation()
  // Navbar/SideDrawer "Daftar" pautan ke /profil bawa state={{ mod: 'daftar' }}
  // supaya terus mendarat di tab/panel Daftar, tak perlu klik togol sekali
  // lagi. Kalau tiada state (cth. akses /profil terus/dari pautan lain),
  // lalai 'login'.
  const [modDipilih, setModDipilih] = useState(location.state?.mod === 'daftar' ? 'daftar' : 'login')
  const mod = pendaftaranDibuka ? modDipilih : 'login'
  const k = KANDUNGAN[mod]

  return (
    <main className="mx-auto max-w-md sm:max-w-2xl px-4 sm:px-6 py-8 sm:py-16">
      <div className="rounded-card overflow-hidden shadow-soft bg-surface sm:flex">
        {/* Tab suis - mobile sahaja, cuma kalau pendaftaran dibuka */}
        {pendaftaranDibuka && (
          <div className="flex sm:hidden">
            <button
              onClick={() => setModDipilih('login')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mod === 'login' ? 'bg-brand-red text-white' : 'bg-surface text-inkmuted'}`}
            >
              Log Masuk
            </button>
            <button
              onClick={() => setModDipilih('daftar')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mod === 'daftar' ? 'bg-brand-red text-white' : 'bg-surface text-inkmuted'}`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Panel warna jenama - desktop sahaja, cuma kalau pendaftaran dibuka */}
        {pendaftaranDibuka && (
          <div
            className={`hidden sm:flex sm:w-64 shrink-0 text-white p-8 flex-col items-center justify-center text-center gap-4 ${mod === 'login' ? 'sm:order-1' : 'sm:order-2'}`}
            style={{ background: GRADIEN_JENAMA }}
          >
            <img src="/logo.png" alt="" className="h-14 w-14 rounded-full bg-white object-contain p-1" />
            <h3 className="text-lg font-bold">{k.panel.tajuk}</h3>
            <p className="text-sm opacity-85">{k.panel.teks}</p>
            <button
              onClick={() => setModDipilih(mod === 'login' ? 'daftar' : 'login')}
              className="border-2 border-white rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-white/10"
            >
              {k.panel.togol}
            </button>
          </div>
        )}

        {/* Kandungan utama */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col items-center text-center gap-3">
          <span
            className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full"
            style={k.warnaLencana}
          >
            {k.lencana}
          </span>
          <h2 className="text-2xl font-extrabold text-ink">{k.tajuk}</h2>
          <p className="text-sm text-inkmuted max-w-xs">
            {mod === 'login'
              ? `Log masuk dengan akaun Google staff sekolah untuk akses ${namaHalaman}.`
              : 'Daftar dengan akaun Google, lengkapkan profile, dan tunggu kelulusan admin.'}
          </p>
          <button
            onClick={() => signInWithGoogle(mod)}
            className="flex items-center justify-center gap-3 w-full max-w-[280px] h-13 py-3.5 rounded-card border border-border bg-surface text-sm font-semibold text-ink shadow-soft hover:bg-base transition-colors mt-2"
          >
            <GoogleIcon size={18} />
            {k.butang}
          </button>
          <p className="text-[11px] text-inkmuted mt-1">Khas untuk staff SK Pendidikan Khas Kuantan sahaja.</p>
        </div>
      </div>
    </main>
  )
}
