import { Pencil, Trash2 } from 'lucide-react'

export default function KumpulanBertugasCard({ kumpulan, isAdmin, onEdit, onPadam }) {
  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: kumpulan.warnaBg, color: kumpulan.warnaTeks }}
      >
        <span className="text-sm font-semibold">{kumpulan.nama}</span>
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(kumpulan)} aria-label="Edit kumpulan" className="p-1.5 rounded-card hover:bg-black/10">
              <Pencil size={14} />
            </button>
            <button onClick={() => onPadam(kumpulan.id)} aria-label="Padam kumpulan" className="p-1.5 rounded-card hover:bg-black/10">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        {(kumpulan.ahli ?? []).length === 0 ? (
          <p className="text-xs text-inkmuted">Tiada ahli lagi.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {kumpulan.ahli.map((a) => (
              <li key={a.emel} className="text-ink">
                {a.nama} <span className="text-xs text-inkmuted">· {a.jawatan}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
