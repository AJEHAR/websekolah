import { useState } from 'react'
import { X } from 'lucide-react'

export default function TukarGuruModal({ open, laporan, profiles, onClose, onTukar }) {
  const [guruEmel, setGuruEmel] = useState(laporan?.guruEmel ?? '')
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open || !laporan) return null

  async function hantar(e) {
    e.preventDefault()
    const guru = profiles.find((p) => p.emel === guruEmel)
    if (!guru) return
    setMenyimpan(true)
    try {
      await onTukar(guruEmel, guru.nama)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Tukar Guru</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-4">{laporan.mataPelajaran} · {laporan.tahunDarjah}</p>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="tukarGuruEmel" className="block text-sm font-medium text-ink mb-1">Nama Guru Baru</label>
            <select
              id="tukarGuruEmel"
              required
              value={guruEmel}
              onChange={(e) => setGuruEmel(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih guru --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.emel}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {menyimpan ? 'Menyimpan…' : 'Tukar'}
            </button>
            <button type="button" onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
