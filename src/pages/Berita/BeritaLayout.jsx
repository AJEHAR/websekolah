import { Outlet } from 'react-router-dom'

// Layout untuk seksyen "Berita". <Outlet /> akan render BeritaList (induk)
// atau BeritaDetail (sub-page) bergantung pada URL semasa.
// Kalau nak header/breadcrumb khas untuk semua page dalam seksyen Berita,
// letak di sini supaya terpakai pada semua sub-page.
export default function BeritaLayout() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16">
      <Outlet />
    </main>
  )
}
