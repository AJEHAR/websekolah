import { BarChart3, Table2, LogIn, LogOut, ClipboardCheck, Utensils } from 'lucide-react'

export const MAKLUMAT_MURID_AKSES_PANTAS = [
  { label: 'Analisis', to: '/maklumat-murid/analisis', Ikon: BarChart3 },
  { label: 'Semakan Murid', to: '/maklumat-murid/semakan', Ikon: Table2 },
  { label: 'Daftar Masuk Murid', to: '/maklumat-murid/daftar-masuk', Ikon: LogIn },
  { label: 'Daftar Keluar Murid', to: '/maklumat-murid/daftar-keluar', Ikon: LogOut },
  { label: 'Kehadiran Murid', to: '/maklumat-murid/kehadiran-murid', Ikon: ClipboardCheck },
  { label: 'Kehadiran RMT', to: '/maklumat-murid/kehadiran-rmt', Ikon: Utensils },
]
