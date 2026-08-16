import { Users, UserCheck, ShieldCheck, ClipboardList, Table2, Award, Image, FileUp, BookMarked, Layers, ShieldBan } from 'lucide-react'

export const ADMIN_AKSES_PANTAS = [
  { label: 'Staff', to: '/admin/staff', Ikon: Users },
  { label: 'Menunggu Kelulusan', to: '/admin/menunggu', Ikon: UserCheck },
  { label: 'Emel Disekat', to: '/admin/sekatan', Ikon: ShieldBan },
  { label: 'Pentadbir', to: '/admin/pentadbir', Ikon: ShieldCheck },
  { label: 'Blok 3K', to: '/admin/blok3k', Ikon: ClipboardList },
  { label: 'Lajur Murid', to: '/admin/lajur-murid', Ikon: Table2 },
  { label: 'Kategori UBKS', to: '/admin/kategori-ubks', Ikon: Award },
  { label: 'Panitia RPT', to: '/admin/panitia-rpt', Ikon: BookMarked },
  { label: 'Kategori RPT', to: '/admin/kategori-rpt', Ikon: Layers },
  { label: 'Latar Belakang Hub', to: '/admin/latar-hub', Ikon: Image },
  { label: 'Import Laporan Perhimpunan', to: '/admin/import-perhimpunan', Ikon: FileUp },
]
