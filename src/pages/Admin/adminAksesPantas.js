import { Users, ShieldCheck, ClipboardList, Table2, Award, Image, FileUp, BookMarked, Layers, ShieldBan } from 'lucide-react'

export const ADMIN_AKSES_PANTAS = [
  { label: 'Staf/Admin', to: '/admin/staff', Ikon: Users },
  { label: 'Emel Disekat', to: '/admin/sekatan', Ikon: ShieldBan },
  { label: 'Blok 3K', to: '/admin/blok3k', Ikon: ClipboardList },
  { label: 'Lajur Murid', to: '/admin/lajur-murid', Ikon: Table2 },
  { label: 'Kategori UBKS', to: '/admin/kategori-ubks', Ikon: Award },
  { label: 'Kategori', to: '/admin/kategori-rpt', Ikon: Layers },
  { label: 'Panitia', to: '/admin/panitia-rpt', Ikon: BookMarked },
  { label: 'Latar Belakang Hub', to: '/admin/latar-hub', Ikon: Image },
  { label: 'Import Laporan Perhimpunan', to: '/admin/import-perhimpunan', Ikon: FileUp },
]
