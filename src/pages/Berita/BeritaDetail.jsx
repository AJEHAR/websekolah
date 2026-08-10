import { useParams, Link } from 'react-router-dom'

// Sub-page untuk /berita/:slug — contoh macam mana sub-page dinamik berfungsi.
export default function BeritaDetail() {
  const { slug } = useParams()

  return (
    <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12">
      <Link to="/berita" className="text-xs font-medium text-brand-red">&larr; Kembali ke senarai berita</Link>
      <h1 className="text-xl sm:text-2xl font-bold text-ink mt-4">Sub-page berita: {slug}</h1>
      <p className="text-inkmuted mt-2 text-sm">
        Ini contoh sub-page dinamik. Kandungan artikel sebenar untuk "{slug}" akan diisi kemudian
        (contohnya dari Firestore atau Google Sheet).
      </p>
    </div>
  )
}
