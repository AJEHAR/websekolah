import { Users, UserCheck, ShieldCheck, ClipboardList, Table2, Award } from 'lucide-react'

export const ADMIN_AKSES_PANTAS = [
  { label: 'Staff', to: '/admin/staff', Ikon: Users },
  { label: 'Menunggu Kelulusan', to: '/admin/menunggu', Ikon: UserCheck },
  { label: 'Pentadbir', to: '/admin/pentadbir', Ikon: ShieldCheck },
  { label: 'Blok 3K', to: '/admin/blok3k', Ikon: ClipboardList },
  { label: 'Lajur Murid', to: '/admin/lajur-murid', Ikon: Table2 },
  { label: 'Kategori UBKS', to: '/admin/kategori-ubks', Ikon: Award },
]
