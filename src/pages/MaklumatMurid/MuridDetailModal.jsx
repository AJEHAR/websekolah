import { X } from 'lucide-react'
import { KUMPULAN_MEDAN, LABEL_MEDAN } from './muridFields.js'

export default function MuridDetailModal({ murid, onClose }) {
  if (!murid) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-ink">{murid.nama}</h2>
            <p className="text-xs text-inkmuted">{murid.namaKelas} · {murid.tahunTingkatan}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {KUMPULAN_MEDAN.map((kumpulan) => (
            <div key={kumpulan.tajuk}>
              <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">{kumpulan.tajuk}</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-border rounded-card p-3">
                {kumpulan.medan.map((kunci) => (
                  <div key={kunci} className="min-w-0">
                    <dt className="text-xs text-inkmuted truncate">{LABEL_MEDAN[kunci]}</dt>
                    <dd className="text-ink font-medium truncate">{murid[kunci] || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
