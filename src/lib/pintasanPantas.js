import { CalendarCheck, ClipboardCheck, Users, GraduationCap, Award, ClipboardList } from 'lucide-react'

// "Akses Pantas" - butang terapung global (muncul di SEMUA page): gabungan
// 2 tugas harian paling kerap (Daftar Keberadaan, Isi Kehadiran Murid) +
// pautan terus ke 4 hub seksyen utama (Guru Bertugas, HEM, KOKU, KURI) -
// tanpa perlu buka menu navbar dulu. Sengaja TAK disekat ikut status
// kelulusan admin (staff "menunggu" pun nampak butang ni) - kalau tersasar
// tekan, PenggeraAksesTerhad dalam App.jsx dah kendalikan redirect balik ke
// Utama macam biasa, jadi tiada risiko keselamatan, cuma kesederhanaan (tak
// payah logik tambahan di sini).
//
// SUSUNAN SENGAJA: entri PALING BAWAH dalam senarai ni = PALING RAPAT dengan
// butang bila menu dibuka (ButangTerapung.jsx render ikut susunan tertib,
// butang sendiri di paling bawah kotak) - jadi Daftar Keberadaan & Isi
// Kehadiran Murid (2 tugas HARIAN paling kerap, senang tekan) diletak
// TERAKHIR di sini, bukan pertama.
export const PINTASAN_PANTAS = [
  { label: 'Guru Bertugas', to: '/guru-bertugas', Ikon: Users },
  { label: 'HEM', to: '/maklumat-murid', Ikon: GraduationCap },
  { label: 'KOKU', to: '/eubks', Ikon: Award },
  { label: 'KURI', to: '/kurikulum', Ikon: ClipboardList },
  { label: 'Isi Kehadiran Murid', to: '/maklumat-murid/kehadiran-murid', Ikon: ClipboardCheck },
  { label: 'Daftar Keberadaan', to: '/keberadaan/daftar', Ikon: CalendarCheck },
]
