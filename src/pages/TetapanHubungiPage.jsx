import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useIsAdmin } from '../hooks/useIsAdmin.js'
import { useTetapanHubungi, simpanTetapanHubungi } from '../hooks/useTetapanHubungi.js'

// Borang sunting maklumat page Hubungi (Alamat/Telefon/Faks/Facebook) -
// admin PENUH sahaja (bukan admin seksyen) sebab maklumat ni dipaparkan
// kepada AWAM (sesiapa sahaja, termasuk bukan staff) - kesan silap lebih
// besar berbanding tetapan dalaman biasa.
export default function TetapanHubungiPage() {
  const { user, loading: loadingAuth } = useAuth()
  const { isSuperAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const { tetapan, loading: loadingTetapan } = useTetapanHubungi()

  const [alamat, setAlamat] = useState('')
  const [telefon, setTelefon] = useState('')
  const [faks, setFaks] = useState('')
  const [facebook, setFacebook] = useState('')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [berjaya, setBerjaya] = useState(false)

  useEffect(() => {
    if (!loadingTetapan) {
      setAlamat(tetapan.alamat)
      setTelefon(tetapan.telefon)
      setFaks(tetapan.faks)
      setFacebook(tetapan.facebook)
    }
  }, [loadingTetapan, tetapan])

  if (loadingAuth || (user && loadingAdmin)) {
    return <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-sm text-inkmuted">Memuatkan…</main>
  }

  if (!user || !isSuperAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card p-8 text-center">
          <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
          <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
        </div>
      </main>
    )
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    setBerjaya(false)
    if (!alamat.trim() || !telefon.trim()) return setRalat('Sila isi sekurang-kurangnya Alamat dan Telefon.')

    setMenyimpan(true)
    try {
      await simpanTetapanHubungi(
        { alamat: alamat.trim(), telefon: telefon.trim(), faks: faks.trim(), facebook: facebook.trim() },
        user.uid
      )
      setBerjaya(true)
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 sm:px-6 py-8 lg:py-12">
      <Link to="/hubungi" className="inline-flex items-center gap-1 text-xs font-medium text-brand-red mb-4">
        <ChevronLeft size={14} /> Kembali ke Hubungi Kami
      </Link>
      <h1 className="text-xl font-bold text-ink mb-1">Tetapan Hubungi</h1>
      <p className="text-xs text-inkmuted mb-6">Maklumat ni dipaparkan kepada SEMUA pengunjung di page Hubungi (awam, tak perlu log masuk).</p>

      <form onSubmit={hantar} className="space-y-4 bg-surface border border-border rounded-card p-6">
        <div>
          <label htmlFor="alamat" className="block text-sm font-medium text-ink mb-1">Alamat <span className="text-brand-red">*</span></label>
          <textarea
            id="alamat"
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none"
          />
        </div>
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-ink mb-1">Telefon <span className="text-brand-red">*</span></label>
          <input
            id="telefon"
            type="text"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="cth. 09-5739495"
            className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
          />
        </div>
        <div>
          <label htmlFor="faks" className="block text-sm font-medium text-ink mb-1">Faks</label>
          <input
            id="faks"
            type="text"
            value={faks}
            onChange={(e) => setFaks(e.target.value)}
            placeholder="cth. 09-5739496"
            className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
          />
        </div>
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium text-ink mb-1">Pautan Facebook</label>
          <input
            id="facebook"
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://www.facebook.com/..."
            className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
          />
        </div>

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}
        {berjaya && <p className="text-sm" style={{ color: '#27500A' }}>Berjaya disimpan.</p>}

        <button type="submit" disabled={menyimpan} className="w-full h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
    </main>
  )
}
