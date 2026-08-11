import { useState } from 'react'
import { X } from 'lucide-react'

export default function PerancanganModal({ baris, onClose, onSimpan }) {
  const [perancangan, setPerancangan] = useState(baris?.perancangan ?? '')
  const [tarikh, setTarikh] = useState(baris?.tarikh ?? '')
  const [selesai, setSelesai] = useState(baris?.selesai ?? false)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!baris) return null

  async function hantar(e) {
    e.preventDefault()
    setMenyimpan(true)
    try {
      await onSimpan({ perancangan: perancangan.trim(), tarikh, selesai })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Perjumpaan {baris.perjumpaan}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="perancanganText" className="block text-sm font-medium text-ink mb-1">Perancangan</label>
            <textarea
              id="perancanganText"
              rows={7}
              value={perancangan}
              onChange={(e) => setPerancangan(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
              placeholder={'Boleh guna bullet/numbering, contoh:\n1. Aktiviti A\n2. Aktiviti B'}
            />
          </div>
          <div>
            <label htmlFor="tarikhPerancangan" className="block text-sm font-medium text-ink mb-1">Tarikh</label>
            <input
              id="tarikhPerancangan"
              type="date"
              value={tarikh}
              onChange={(e) => setTarikh(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={selesai} onChange={(e) => setSelesai(e.target.checked)} className="h-4 w-4" />
            Sudah dilaksanakan (tanda hijau)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {menyimpan ? 'Menyimpan…' : 'Simpan'}
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
