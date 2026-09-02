import { Users, ClipboardCheck, BarChart3, BookOpen, Award, IdCard, Sparkles, FolderOpen } from 'lucide-react'

// Senarai akses pantas untuk hub KOKU - tambah entri baru di sini bila
// ada sub-page baru, akan terus muncul di kad hub (telefon & desktop).
export const EUBKS_AKSES_PANTAS = [
  { label: 'Murid UBKS', to: '/eubks/murid-ubks', Ikon: Users },
  { label: 'Profil Murid', to: '/eubks/profil-murid', Ikon: IdCard },
  { label: 'Jawatankuasa UBKS', to: '/eubks/jawatankuasa-ubks', Ikon: Award },
  { label: 'Kehadiran UBKS', to: '/eubks/kehadiran-ubks', Ikon: ClipboardCheck },
  { label: 'Laporan UBKS', to: '/eubks/laporan-ubks', Ikon: BarChart3 },
  { label: 'Perancangan UBKS', to: '/eubks/perancangan-ubks', Ikon: BookOpen },
  { label: 'OPR', to: '/eubks/opr', Ikon: Sparkles },
  { label: 'Surat/SPI', to: '/eubks/surat-spi', Ikon: FolderOpen },
]
