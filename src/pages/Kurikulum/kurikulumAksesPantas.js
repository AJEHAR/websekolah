import { ClipboardList, FileText, CalendarRange, FileStack, FolderOpen, Sparkles } from 'lucide-react'

// Senarai akses pantas untuk hub KURI - tambah entri baru di sini bila
// ada sub-page baru (pengisian akan ditambah kemudian), akan terus muncul
// di kad hub (telefon & desktop) dan di menu nav (lihat navConfig.js -
// senarai kat sini TAK auto-sync ke nav, kena update dua-dua tempat).
export const KURIKULUM_AKSES_PANTAS = [
  { label: 'Laporan PLC', to: '/kurikulum/borang-plc', Ikon: ClipboardList },
  { label: 'RPI', to: '/kurikulum/rpi', Ikon: FileText },
  { label: 'RPT', to: '/kurikulum/rpt', Ikon: CalendarRange },
  { label: 'Template Kertas Kerja', to: '/kurikulum/template-kertas-kerja', Ikon: FileStack },
  { label: 'Koleksi Pekeliling', to: '/kurikulum/koleksi-pekeliling', Ikon: FolderOpen },
  { label: 'OPR', to: '/kurikulum/opr', Ikon: Sparkles },
]
