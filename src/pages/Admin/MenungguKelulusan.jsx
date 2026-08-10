import { Check, X } from 'lucide-react'
import { luluskanProfile, padamProfileAdmin } from '../../hooks/useAdminProfiles.js'

export default function MenungguKelulusan({ profiles, loading, onSelesai }) {
  const senarai = profiles.filter((p) => p.status === 'menunggu')

  async function lulus(emel) {
    await luluskanProfile(emel)
    onSelesai()
  }

  async function tolak(emel) {
    if (!window.confirm('Tolak permohonan ni? Profile akan dipadam dan staff perlu daftar semula.')) return
    await padamProfileAdmin(emel)
    onSelesai()
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>
  if (senarai.length === 0) {
    return <p className="text-sm text-inkmuted">Tiada permohonan menunggu kelulusan.</p>
  }

  return (
    <div className="space-y-2">
      {senarai.map((p) => (
        <div key={p.id} className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface">
          <div className="h-11 w-11 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
            {p.gambarURL ? (
              <img src={p.gambarURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-inkmuted">Tiada</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{p.nama}</p>
            <p className="text-xs text-inkmuted truncate">{p.jawatan} · {p.kategori}</p>
            <p className="text-xs text-inkmuted truncate">{p.emel}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => lulus(p.emel)}
              aria-label="Lulus"
              className="p-2 rounded-card hover:bg-base text-green-700"
              title="Lulus"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => tolak(p.emel)}
              aria-label="Tolak"
              className="p-2 rounded-card hover:bg-base text-brand-red"
              title="Tolak"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
