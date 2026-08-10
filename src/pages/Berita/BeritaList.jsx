import { Link } from 'react-router-dom'

// Page induk untuk /berita — akan papar senarai berita.
// Contoh sub-page dulu supaya boleh test navigasi ke sub-page.
const contohBerita = [
  { slug: 'contoh-berita-1', tajuk: 'Contoh Tajuk Berita 1' },
]

export default function BeritaList() {
  return (
    <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12">
      <h1 className="text-xl sm:text-2xl font-bold text-ink">Berita &amp; Pengumuman</h1>
      <p className="text-inkmuted mt-2 text-sm">Halaman ini kosong buat masa ini — senarai berita sebenar akan ditambah kemudian.</p>

      <div className="mt-8 space-y-3">
        {contohBerita.map((b) => (
          <Link
            key={b.slug}
            to={`/berita/${b.slug}`}
            className="block p-4 rounded-card border border-border hover:border-brand-red transition-colors text-sm font-medium text-ink"
          >
            {b.tajuk} →
          </Link>
        ))}
      </div>
    </div>
  )
}
