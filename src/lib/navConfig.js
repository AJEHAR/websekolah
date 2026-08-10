// Struktur nav dikongsi antara Navbar (desktop, guna terus 'to' - abaikan children)
// dan SideDrawer (mobile, expand/collapse 'children' sebagai accordion).
export const NAV_ITEMS = [
  { label: 'Utama', to: '/' },
  {
    label: 'Keberadaan',
    to: '/keberadaan',
    children: [
      { label: 'Hari Ini', to: '/keberadaan/hari-ini' },
      { label: 'Esok', to: '/keberadaan/esok' },
      { label: 'Log', to: '/keberadaan/log' },
      { label: 'Rekod Saya', to: '/keberadaan/saya' },
    ],
  },
  {
    label: 'Guru Bertugas',
    to: '/guru-bertugas',
    children: [
      { label: 'Kumpulan', to: '/guru-bertugas/kumpulan' },
      { label: 'Laporan 3K', to: '/guru-bertugas/3k' },
      { label: 'Jana Banci', to: '/guru-bertugas/banci' },
      { label: 'Harian', to: '/guru-bertugas/harian' },
    ],
  },
  { label: 'Profil', to: '/profil' },
]

// Ditambah secara berasingan (hanya untuk admin) - lihat Navbar.jsx
export const ADMIN_NAV_ITEM = {
  label: 'Panel Admin',
  to: '/admin',
  children: [
    { label: 'Staff', to: '/admin/staff' },
    { label: 'Menunggu Kelulusan', to: '/admin/menunggu' },
    { label: 'Pentadbir', to: '/admin/pentadbir' },
    { label: 'Blok 3K', to: '/admin/blok3k' },
  ],
}
