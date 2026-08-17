import { useState } from 'react'
import { X } from 'lucide-react'

export default function Laporan3KModal({ blok, rekod, profiles, onClose, onSimpan }) {
  const [catatanKeselamatan, setCatatanKeselamatan] = useState(rekod?.catatanKeselamatan ?? '')
  const [catatanKebersihan, setCatatanKebersihan] = useState(rekod?.catatanKebersihan ?? '')
  const [catatanDisiplin, setCatatanDisiplin] = useState(rekod?.catatanDisiplin ?? '')
  const [guru, setGuru] = useState(rekod?.guru ?? null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!blok) return null

  function ubahGuru(emel) {
    const p = profiles.find((pr) => pr.emel === emel)
    setGuru(p ? { emel: p.emel, nama: p.nama } : null)
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!catatanKeselamatan.trim()) {
      setRalat('Catatan Keselamatan wajib diisi.')
      return
    }
    if (!catatanKebersihan.trim()) {
      setRalat('Catatan Kebersihan wajib diisi.')
      return
    }
    if (blok.adaDisiplin && !catatanDisiplin.trim()) {
      setRalat('Catatan Disiplin wajib diisi.')
      return
    }
    if (!guru) {
      setRalat('Sila pilih nama guru.')
      return
    }

    setMenyimpan(true)
    try {
      await onSimpan({
        catatanKeselamatan: catatanKeselamatan.trim(),
        catatanKebersihan: catatanKebersihan.trim(),
        ...(blok.adaDisiplin ? { catatanDisiplin: catatanDisiplin.trim() } : {}),
        guru,
      })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{blok.nama}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="catatanKeselamatan" className="block text-sm font-medium text-ink mb-1">Catatan Keselamatan <span className="text-brand-red">*</span></label>
            <textarea
              id="catatanKeselamatan"
              required
              rows={3}
              value={catatanKeselamatan}
              onChange={(e) => setCatatanKeselamatan(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
              placeholder="Catatan keselamatan hari ini…"
            />
          </div>

          <div>
            <label htmlFor="catatanKebersihan" className="block text-sm font-medium text-ink mb-1">Catatan Kebersihan <span className="text-brand-red">*</span></label>
            <textarea
              id="catatanKebersihan"
              required
              rows={3}
              value={catatanKebersihan}
              onChange={(e) => setCatatanKebersihan(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
              placeholder="Catatan kebersihan hari ini…"
            />
          </div>

          {blok.adaDisiplin && (
            <div>
              <label htmlFor="catatanDisiplin" className="block text-sm font-medium text-ink mb-1">Catatan Disiplin <span className="text-brand-red">*</span></label>
              <textarea
                id="catatanDisiplin"
                required
                rows={3}
                value={catatanDisiplin}
                onChange={(e) => setCatatanDisiplin(e.target.value)}
                className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
                placeholder="Catatan disiplin hari ini…"
              />
            </div>
          )}

          <div>
            <label htmlFor="guru3k" className="block text-sm font-medium text-ink mb-1">Nama Guru <span className="text-brand-red">*</span></label>
            <select
              id="guru3k"
              required
              value={guru?.emel ?? ''}
              onChange={(e) => ubahGuru(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih guru --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.emel}>{p.nama}</option>
              ))}
            </select>
          </div>

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={menyimpan}
              className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
            >
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
