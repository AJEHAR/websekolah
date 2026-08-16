import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { usePanitiaRPT, tambahPanitia, padamPanitia } from '../../hooks/usePanitiaRPT.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import AdminSeksyenGate from './AdminSeksyenGate.jsx'

export default function PanitiaRPTPage() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  return (
    <AdminSeksyenGate adaSeksyen={adaSeksyen} seksyen="kurikulum" namaSeksyen="KURI">
      <Isi />
    </AdminSeksyenGate>
  )
}

function Isi() {
  const { senarai, loading, muatSemula } = usePanitiaRPT()
  const [nama, setNama] = useState('')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  async function tambah(e) {
    e.preventDefault()
    setRalat(null)
    if (!nama.trim()) {
      setRalat('Sila isi nama panitia.')
      return
    }
    setMenyimpan(true)
    try {
      const turutanBaru = senarai.length > 0 ? Math.max(...senarai.map((k) => k.turutan ?? 0)) + 1 : 1
      await tambahPanitia(nama.trim(), turutanBaru)
      setNama('')
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal tambah panitia.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam(id) {
    if (!window.confirm('Padam panitia ini? Laporan RPT sedia ada yang guna panitia ni tak akan terjejas, cuma tak boleh pilih untuk laporan baru.')) return
    await padamPanitia(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        Senarai panitia yang boleh dipilih staff bila muat naik RPT (contoh: Panitia Bahasa Melayu, Panitia Matematik).
      </p>

      <form onSubmit={tambah} className="flex flex-wrap items-end gap-2 mb-5">
        <div>
          <label htmlFor="namaPanitia" className="block text-xs font-medium text-ink mb-1">Nama Panitia</label>
          <input
            id="namaPanitia"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="contoh: Panitia Bahasa Melayu"
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
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
        <p className="text-sm text-inkmuted">Tiada panitia lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
              <span className="text-sm font-semibold text-ink">{k.nama}</span>
              <button onClick={() => padam(k.id)} aria-label="Padam panitia" className="p-2 rounded-card hover:bg-base text-brand-red">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
