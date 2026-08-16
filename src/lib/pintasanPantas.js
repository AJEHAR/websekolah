import { CalendarCheck, ClipboardCheck } from 'lucide-react'

// Pintasan pantas untuk butang terapung (ButangTerapung.jsx) - 2 tugas
// HARIAN paling kerap dibuat staff, supaya boleh terus akses dari MANA-MANA
// page tanpa perlu susur menu > seksyen > subpage. Tambah entri baru di
// sini je bila perlu (senarai ni je yang perlu diubah, komponen dah generik).
export const PINTASAN_PANTAS = [
  { label: 'Daftar Keberadaan', to: '/keberadaan/daftar', Ikon: CalendarCheck },
  { label: 'Isi Kehadiran Murid', to: '/maklumat-murid/kehadiran-murid', Ikon: ClipboardCheck },
]
