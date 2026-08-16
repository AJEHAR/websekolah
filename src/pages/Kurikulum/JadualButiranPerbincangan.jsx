import { Plus, Trash2 } from 'lucide-react'

// baris: [{ catatan, tindakan }]
export default function JadualButiranPerbincangan({ baris, onUbah }) {
  function ubahBaris(i, medan, nilai) {
    const salinan = [...baris]
    salinan[i] = { ...salinan[i], [medan]: nilai }
    onUbah(salinan)
  }

  function tambahBaris() {
    onUbah([...baris, { catatan: '', tindakan: '' }])
  }

  function padamBaris(i) {
    onUbah(baris.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">Butiran Perbincangan</label>
      <div className="space-y-2">
        {baris.map((b, i) => (
          <div key={i} className="p-3 rounded-card border border-border bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-inkmuted">Butiran {i + 1}</span>
              <button
                type="button"
                onClick={() => padamBaris(i)}
                aria-label="Padam butiran"
                className="p-1 rounded-card hover:bg-base text-brand-red"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div>
              <label className="block text-xs text-inkmuted mb-1">Catatan (Isu/Fokus/Data/Bahan Sumber)</label>
              <textarea
                rows={2}
                value={b.catatan}
                onChange={(e) => ubahBaris(i, 'catatan', e.target.value)}
                className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-inkmuted mb-1">Tindakan</label>
              <textarea
                rows={2}
                value={b.tindakan}
                onChange={(e) => ubahBaris(i, 'tindakan', e.target.value)}
                className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={tambahBaris}
        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-red"
      >
        <Plus size={14} /> Tambah Butiran
      </button>
    </div>
  )
}
