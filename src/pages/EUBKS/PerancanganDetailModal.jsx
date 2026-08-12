import { useState } from 'react'
import { X, CheckCircle2, Circle } from 'lucide-react'
import { todayISO } from '../../lib/dateUtils.js'

export default function PerancanganDetailModal({ baris, onClose, onTandaSelesai, onBatalSelesai }) {
  const [mintaTarikh, setMintaTarikh] = useState(false)
  const [tarikhSelesai, setTarikhSelesai] = useState(todayISO())
  const [menyimpan, setMenyimpan] = useState(false)

  if (!baris) return null

  async function sahkanSelesai(e) {
    e.preventDefault()
    setMenyimpan(true)
    try {
      await onTandaSelesai(tarikhSelesai)
      setMintaTarikh(false)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Perjumpaan {baris.perjumpaan}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1.5">Perancangan</h3>
          <p className="text-sm text-ink whitespace-pre-wrap p-3 rounded-card bg-base min-h-[60px]">
            {baris.perancangan || <span className="text-inkmuted">Belum diisi.</span>}
          </p>
        </div>

        <div className="mb-6 p-3 rounded-card border border-border">
          {baris.selesai ? (
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#27500A' }}>
                <CheckCircle2 size={16} /> Selesai pada {baris.tarikhSelesai || '-'}
              </p>
              <button onClick={onBatalSelesai} className="text-xs font-medium text-inkmuted underline shrink-0">
                Batalkan
              </button>
            </div>
          ) : mintaTarikh ? (
            <form onSubmit={sahkanSelesai} className="space-y-3">
              <label htmlFor="tarikhSelesai" className="block text-xs font-medium text-ink">Tarikh dilaksanakan</label>
              <input
                id="tarikhSelesai"
                type="date"
                required
                value={tarikhSelesai}
                onChange={(e) => setTarikhSelesai(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={menyimpan} className="flex-1 h-10 rounded-card text-white text-xs font-semibold disabled:opacity-60" style={{ backgroundColor: '#27500A' }}>
                  {menyimpan ? 'Menyimpan…' : 'Sahkan Selesai'}
                </button>
                <button type="button" onClick={() => setMintaTarikh(false)} className="h-10 px-4 rounded-card border border-border text-xs font-medium text-ink">
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setMintaTarikh(true)}
              className="w-full h-11 rounded-card border-2 border-dashed flex items-center justify-center gap-2 text-sm font-semibold text-inkmuted hover:text-ink"
              style={{ borderColor: '#C8DDB0' }}
            >
              <Circle size={16} /> Tandakan Selesai (Done)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
