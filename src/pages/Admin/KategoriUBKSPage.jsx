import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useKategoriUBKS, tambahKategori, padamKategori } from '../../hooks/useKategoriUBKS.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import AdminSeksyenGate from './AdminSeksyenGate.jsx'

export default function KategoriUBKSPage() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  return (
    <AdminSeksyenGate adaSeksyen={adaSeksyen} seksyen="ubks" namaSeksyen="eUBKS Ko">
      <Isi />
    </AdminSeksyenGate>
  )
}

function Isi() {
  const { senarai, loading, muatSemula } = useKategoriUBKS()
  const [nama, setNama] = useState('')
  const [kod, setKod] = useState('')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  async function tambah(e) {
    e.preventDefault()
    setRalat(null)
    if (!nama.trim() || !kod.trim()) {
      setRalat('Sila isi nama dan kod.')
      return
    }
    setMenyimpan(true)
    try {
      const turutanBaru = senarai.length > 0 ? Math.max(...senarai.map((k) => k.turutan ?? 0)) + 1 : 1
      await tambahKategori(nama.trim(), kod.trim().toUpperCase(), turutanBaru)
      setNama('')
      setKod('')
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal tambah kategori.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam(id) {
    if (!window.confirm('Padam kategori ini? Unit sedia ada yang guna kategori ni tak akan terjejas, cuma tak boleh pilih untuk unit baru.')) return
    await padamKategori(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        Setiap unit UBKS kena ditagging kategori (Unit Beruniform/Kelab/Sukan/lain-lain) bila dicipta - senang merentasi data (contoh: Papan Kehadiran UBKS).
      </p>

      <form onSubmit={tambah} className="flex flex-wrap items-end gap-2 mb-5">
        <div>
          <label htmlFor="namaKategori" className="block text-xs font-medium text-ink mb-1">Nama Kategori</label>
          <input
            id="namaKategori"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="contoh: Unit Beruniform"
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div>
          <label htmlFor="kodKategori" className="block text-xs font-medium text-ink mb-1">Kod (ringkas)</label>
          <input
            id="kodKategori"
            type="text"
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="contoh: UB"
            maxLength={4}
            className="h-11 w-24 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <button type="submit" disabled={menyimpan} className="h-11 px-4 rounded-card bg-brand-red text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
          <Plus size={16} /> Tambah
        </button>
      </form>
      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada kategori lagi. Cadangan: Unit Beruniform (UB), Kelab (K), Sukan (S).</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
              <div>
                <span className="text-sm font-semibold text-ink">{k.nama}</span>
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-base text-inkmuted">{k.kod}</span>
              </div>
              <button onClick={() => padam(k.id)} aria-label="Padam kategori" className="p-2 rounded-card hover:bg-base text-brand-red">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
