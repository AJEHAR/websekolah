// Struktur nav dikongsi antara Navbar (desktop, guna terus 'to' - abaikan children)
// dan SideDrawer (mobile, expand/collapse 'children' sebagai accordion).
export const NAV_ITEMS = [
  { label: 'Utama', to: '/' },
  {
    label: 'KURI',
    to: '/kurikulum',
    children: [
      { label: 'Laporan PLC', to: '/kurikulum/borang-plc' },
      { label: 'RPI', to: '/kurikulum/rpi' },
      { label: 'RPT', to: '/kurikulum/rpt' },
      { label: 'Template Kertas Kerja', to: '/kurikulum/template-kertas-kerja' },
      { label: 'Koleksi Pekeliling', to: '/kurikulum/koleksi-pekeliling' },
      { label: 'OPR', to: '/kurikulum/opr' },
      // Tambah subpage baru di sini bila dah tahu apa lagi diperlukan -
      // update juga kurikulumAksesPantas.js dan TAJUK_SUBPAGE dalam
      // KurikulumLayout.jsx, + <Route> baru dalam App.jsx.
    ],
  },
  {
    label: 'HEM',
    to: '/maklumat-murid',
    children: [
      { label: 'Analisis', to: '/maklumat-murid/analisis' },
      { label: 'Semakan Murid', to: '/maklumat-murid/semakan' },
      { label: 'Daftar Masuk Murid', to: '/maklumat-murid/daftar-masuk' },
      { label: 'Daftar Keluar Murid', to: '/maklumat-murid/daftar-keluar' },
      { label: 'Kehadiran Murid', to: '/maklumat-murid/kehadiran-murid' },
      { label: 'Kehadiran RMT', to: '/maklumat-murid/kehadiran-rmt' },
    ],
  },
  {
    label: 'KOKU',
    to: '/eubks',
    children: [
      { label: 'Murid UBKS', to: '/eubks/murid-ubks' },
      { label: 'Profil Murid', to: '/eubks/profil-murid' },
      { label: 'Jawatankuasa UBKS', to: '/eubks/jawatankuasa-ubks' },
      { label: 'Kehadiran UBKS', to: '/eubks/kehadiran-ubks' },
      { label: 'Laporan UBKS', to: '/eubks/laporan-ubks' },
      { label: 'Perancangan UBKS', to: '/eubks/perancangan-ubks' },
    ],
  },
  {
    label: 'Keberadaan',
    to: '/keberadaan',
    children: [
      { label: 'Daftar Keberadaan', to: '/keberadaan/daftar' },
      { label: 'Hari Ini', to: '/keberadaan/hari-ini' },
      { label: 'Esok', to: '/keberadaan/esok' },
      { label: 'Log Keberadaan', to: '/keberadaan/log' },
      { label: 'Rekod Saya', to: '/keberadaan/saya' },
    ],
  },
  {
    label: 'Guru Bertugas',
    to: '/guru-bertugas',
    children: [
      { label: 'Kumpulan', to: '/guru-bertugas/kumpulan' },
      { label: 'Laporan 3K', to: '/guru-bertugas/3k' },
      { label: 'Laporan Banci', to: '/guru-bertugas/banci' },
      { label: 'Laporan Harian', to: '/guru-bertugas/harian' },
      { label: 'Laporan Perhimpunan', to: '/guru-bertugas/perhimpunan' },
    ],
  },
  { label: 'Profil', to: '/profil' },
]

// Ditambah secara berasingan (hanya untuk admin) - lihat Navbar.jsx
export const ADMIN_NAV_ITEM = {
  label: 'Panel Admin',
  to: '/admin',
  children: [
    { label: 'Staf/Admin', to: '/admin/staff' },
    { label: 'Emel Disekat', to: '/admin/sekatan' },
    { label: 'Blok 3K', to: '/admin/blok3k' },
    { label: 'Lajur Murid', to: '/admin/lajur-murid' },
    { label: 'Kategori UBKS', to: '/admin/kategori-ubks' },
    { label: 'Kategori', to: '/admin/kategori-rpt' },
    { label: 'Panitia', to: '/admin/panitia-rpt' },
    { label: 'Latar Belakang Hub', to: '/admin/latar-hub' },
    { label: 'Reset Data Ujian', to: '/admin/reset-data' },
  ],
}
