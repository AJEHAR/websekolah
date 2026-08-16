import { ClipboardList, FileText, CalendarRange } from 'lucide-react'

// Senarai akses pantas untuk hub Kurikulum - tambah entri baru di sini bila
// ada sub-page baru (pengisian akan ditambah kemudian), akan terus muncul
// di kad hub (telefon & desktop) dan di menu nav (lihat navConfig.js -
// senarai kat sini TAK auto-sync ke nav, kena update dua-dua tempat).
export const KURIKULUM_AKSES_PANTAS = [
  { label: 'Borang PLC', to: '/kurikulum/borang-plc', Ikon: ClipboardList },
  { label: 'RPI', to: '/kurikulum/rpi', Ikon: FileText },
  { label: 'RPT', to: '/kurikulum/rpt', Ikon: CalendarRange },
]
