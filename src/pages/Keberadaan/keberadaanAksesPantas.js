import { ClipboardPlus, CalendarCheck, CalendarClock, History, UserCheck } from 'lucide-react'

export const KEBERADAAN_AKSES_PANTAS = [
  { label: 'Daftar Keberadaan', to: '/keberadaan/daftar', Ikon: ClipboardPlus },
  { label: 'Hari Ini', to: '/keberadaan/hari-ini', Ikon: CalendarCheck },
  { label: 'Esok', to: '/keberadaan/esok', Ikon: CalendarClock },
  { label: 'Log', to: '/keberadaan/log', Ikon: History },
  { label: 'Rekod Saya', to: '/keberadaan/saya', Ikon: UserCheck },
]
