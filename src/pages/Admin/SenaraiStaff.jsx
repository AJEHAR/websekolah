import { useState } from 'react'
import { Pencil, Trash2, Search } from 'lucide-react'

export default function SenaraiStaff({ profiles, loading, onEdit, onPadam }) {
  const [carian, setCarian] = useState('')

  const disenarai = profiles.filter((p) =>
    `${p.nama ?? ''} ${p.emel ?? ''} ${p.jawatan ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama, emel atau jawatan…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada staff dijumpai.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface">
              <div className="h-11 w-11 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
                {p.gambarURL ? (
                  <img src={p.gambarURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-inkmuted">Tiada</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{p.nama || '(Belum lengkap)'}</p>
                <p className="text-xs text-inkmuted truncate">{p.jawatan} · {p.kategori}</p>
                <p className="text-xs text-inkmuted truncate">{p.emel}</p>
              </div>

              {!p.uid && (
                <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full bg-base border border-border text-inkmuted">
                  Belum log masuk
                </span>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onEdit(p)} aria-label="Edit staff" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onPadam(p.emel)} aria-label="Padam staff" className="p-2 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
