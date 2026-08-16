import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { STRATEGI_PLC_LAJUR } from './plcConstants.js'

export default function PemilihStrategiPLC({ dipilih, onUbah }) {
  const [terbuka, setTerbuka] = useState(false)

  function toggl(strategi) {
    if (dipilih.includes(strategi)) onUbah(dipilih.filter((s) => s !== strategi))
    else onUbah([...dipilih, strategi])
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">
        Strategi PLC {dipilih.length > 0 && `(${dipilih.length} dipilih)`}
      </label>
      <button
        type="button"
        onClick={() => setTerbuka((s) => !s)}
        className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm flex items-center justify-between text-left"
      >
        <span className={dipilih.length === 0 ? 'text-inkmuted' : 'text-ink truncate'}>
          {dipilih.length === 0 ? '-- Pilih strategi (boleh lebih dari satu) --' : dipilih.join(', ')}
        </span>
        <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform ${terbuka ? 'rotate-180' : ''}`} />
      </button>

      {terbuka && (
        <div className="mt-2 p-3 rounded-card border border-border bg-surface max-h-72 overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-x-4">
            {STRATEGI_PLC_LAJUR.flat().map((s) => (
              <label key={s} className="flex items-start gap-2 py-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={dipilih.includes(s)}
                  onChange={() => toggl(s)}
                  className="h-4 w-4 mt-0.5 shrink-0"
                />
                <span className="text-ink italic">{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
