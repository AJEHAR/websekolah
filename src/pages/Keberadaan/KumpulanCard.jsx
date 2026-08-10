import { Pencil, Trash2 } from 'lucide-react'
import { warnaBadge, labelRingkas } from './badgeUtils.js'

export default function KumpulanCard({ tajuk, senarai, currentUserEmel, isAdmin, onEdit, onPadam }) {
  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="bg-base px-3 py-2 border-b border-border">
        <span className="text-[11px] font-semibold text-inkmuted uppercase tracking-wide">
          {tajuk} ({senarai.length})
        </span>
      </div>

      {senarai.length === 0 ? (
        <p className="px-3 py-3 text-xs text-inkmuted">Tiada rekod.</p>
      ) : (
        <div className="divide-y divide-border">
          {senarai.map((r) => {
            const warna = warnaBadge(r.urusan)
            const bolehUrus = isAdmin || r.profilEmel === currentUserEmel
            return (
              <div key={r.id} className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-xs font-medium text-ink truncate flex-1 min-w-0">{r.nama}</span>
                <span
                  className="text-[10px] font-medium px-2 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: warna.bg, color: warna.teks }}
                >
                  {labelRingkas(r)}
                </span>
                {bolehUrus && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => onEdit(r)} aria-label="Edit rekod" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => onPadam(r.id)} aria-label="Padam rekod" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
