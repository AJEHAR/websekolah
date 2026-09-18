import { Users, Award, Wallet, Banknote, Receipt, CalendarDays, Vote } from 'lucide-react'

export const KKGS_AKSES_PANTAS = [
  { label: 'Senarai Ahli', to: '/kkgs/senarai-ahli', Ikon: Users },
  { label: 'Jawatankuasa', to: '/kkgs/jawatankuasa', Ikon: Award },
  { label: 'Pilihan Raya', to: '/kkgs/pilihan-raya', Ikon: Vote },
  { label: 'Program/Aktiviti', to: '/kkgs/program', Ikon: CalendarDays },
  { label: 'Yuran Sumbangan', to: '/kkgs/yuran', Ikon: Wallet },
  { label: 'Kewangan', to: '/kkgs/kewangan', Ikon: Banknote },
  { label: 'Claim KKGS', to: '/kkgs/claim', Ikon: Receipt },
]
