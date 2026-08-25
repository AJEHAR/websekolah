import { useState } from 'react'
import { Search, X } from 'lucide-react'

// Pilihan tunggal staff (dari koleksi 'profiles') - corak SAMA dengan
// PemilihMurid.jsx, cuma sumber data beza. staffDipilih: rekod profile
// penuh (atau null).
export default function PemilihStaff({ senaraiStaff, staffDipilih, onPilih }) {
  const [carian, setCarian] = useState('')
  const [terbuka, setTerbuka] = useState(false)

  const disenarai = senaraiStaff.filter((s) =>
    `${s.nama ?? ''} ${s.jawatan ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  if (staffDipilih) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 rounded-card border border-border bg-base">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{staffDipilih.nama}</p>
          <p className="text-xs text-inkmuted truncate">{staffDipilih.jawatan || '-'}</p>
        </div>
        <button
          type="button"
          onClick={() => onPilih(null)}
          aria-label="Tukar staff"
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
          placeholder="Cari nama staff…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>
      {terbuka && (
        <div className="max-h-56 overflow-y-auto border border-border rounded-card divide-y divide-border">
          {disenarai.length === 0 ? (
            <p className="p-3 text-xs text-inkmuted">Tiada staff dijumpai.</p>
          ) : (
            disenarai.slice(0, 50).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { onPilih(s); setTerbuka(false); setCarian('') }}
                className="w-full text-left p-2.5 text-sm hover:bg-base"
              >
                <span className="text-ink font-medium">{s.nama}</span>
                <span className="text-xs text-inkmuted ml-2">{s.jawatan}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
