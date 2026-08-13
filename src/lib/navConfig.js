// Struktur nav dikongsi antara Navbar (desktop, guna terus 'to' - abaikan children)
// dan SideDrawer (mobile, expand/collapse 'children' sebagai accordion).
export const NAV_ITEMS = [
  { label: 'Utama', to: '/' },
  {
    label: 'Keberadaan',
    to: '/keberadaan',
    children: [
      { label: 'Daftar Keberadaan', to: '/keberadaan/daftar' },
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
      { label: 'Laporan Harian', to: '/guru-bertugas/harian' },
      { label: 'Laporan Perhimpunan', to: '/guru-bertugas/perhimpunan' },
    ],
  },
  {
    label: 'Maklumat Murid',
    to: '/maklumat-murid',
    children: [
      { label: 'Analisis', to: '/maklumat-murid/analisis' },
      { label: 'Semakan Murid', to: '/maklumat-murid/semakan' },
      { label: 'Daftar Masuk Murid', to: '/maklumat-murid/daftar-masuk' },
      { label: 'Daftar Keluar Murid', to: '/maklumat-murid/daftar-keluar' },
    ],
  },
  {
    label: 'eBanci',
    to: '/ebanci',
    children: [
      { label: 'Kehadiran Murid', to: '/ebanci/kehadiran-murid' },
      { label: 'Papan Kehadiran RMT', to: '/ebanci/papan-rmt' },
    ],
  },
  {
    label: 'eUBKS Ko',
    to: '/eubks',
    children: [
      { label: 'Murid UBKS', to: '/eubks/murid-ubks' },
      { label: 'Kehadiran UBKS', to: '/eubks/kehadiran-ubks' },
      { label: 'Laporan UBKS', to: '/eubks/laporan-ubks' },
      { label: 'Perancangan UBKS', to: '/eubks/perancangan-ubks' },
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
    { label: 'Lajur Murid', to: '/admin/lajur-murid' },
    { label: 'Kategori UBKS', to: '/admin/kategori-ubks' },
    { label: 'Latar Belakang Hub', to: '/admin/latar-hub' },
  ],
}
