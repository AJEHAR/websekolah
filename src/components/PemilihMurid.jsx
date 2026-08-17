import { useState } from 'react'
import { Search, X } from 'lucide-react'

// murid dipilih: rekod penuh dari koleksi 'murid' (atau null)
export default function PemilihMurid({ senaraiMurid, muridDipilih, onPilih }) {
  const [carian, setCarian] = useState('')
  const [terbuka, setTerbuka] = useState(false)

  const disenarai = senaraiMurid.filter((m) =>
    `${m.nama ?? ''} ${m.namaKelas ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  if (muridDipilih) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 rounded-card border border-border bg-base">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{muridDipilih.nama}</p>
          <p className="text-xs text-inkmuted truncate">{muridDipilih.namaKelas || '-'}</p>
        </div>
        <button
          type="button"
          onClick={() => onPilih(null)}
          aria-label="Tukar murid"
          className="p-1.5 rounded-card hover:bg-surface text-inkmuted shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-2">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onFocus={() => setTerbuka(true)}
          onChange={(e) => { setCarian(e.target.value); setTerbuka(true) }}
          placeholder="Cari nama murid…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>
      {terbuka && (
        <div className="max-h-56 overflow-y-auto border border-border rounded-card divide-y divide-border">
          {disenarai.length === 0 ? (
            <p className="p-3 text-xs text-inkmuted">Tiada murid dijumpai.</p>
          ) : (
            disenarai.slice(0, 50).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onPilih(m); setTerbuka(false); setCarian('') }}
                className="w-full text-left p-2.5 text-sm hover:bg-base"
              >
                <span className="text-ink font-medium">{m.nama}</span>
                <span className="text-xs text-inkmuted ml-2">{m.namaKelas}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
