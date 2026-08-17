import { useState } from 'react'
import { Search } from 'lucide-react'

// dipilih: [{ emel, nama, ic }]
export default function PemilihAhliKumpulan({ profiles, dipilih, onUbah }) {
  const [carian, setCarian] = useState('')

  const profilDisenarai = profiles.filter((p) =>
    (p.nama ?? '').toLowerCase().includes(carian.toLowerCase())
  )

  function togglAhli(p) {
    const wujud = dipilih.some((a) => a.emel === p.emel)
    if (wujud) onUbah(dipilih.filter((a) => a.emel !== p.emel))
    else onUbah([...dipilih, { emel: p.emel, nama: p.nama, ic: p.ic ?? '' }])
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        Nama & No.KP Ahli Kumpulan {dipilih.length > 0 && `(${dipilih.length} dipilih)`}
      </label>
      <div className="relative mb-2">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama staff…"
          className="w-full h-10 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>
      <div className="max-h-48 overflow-y-auto border border-border rounded-card divide-y divide-border">
        {profilDisenarai.length === 0 ? (
          <p className="p-3 text-xs text-inkmuted">Tiada staff dijumpai.</p>
        ) : (
          profilDisenarai.map((p) => {
            const adaDipilih = dipilih.some((a) => a.emel === p.emel)
            return (
              <label key={p.id} className="flex items-start gap-3 p-2.5 text-sm cursor-pointer hover:bg-base">
                <input
                  type="checkbox"
                  checked={adaDipilih}
                  onChange={() => togglAhli(p)}
                  className="h-4 w-4 shrink-0 mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-ink leading-snug">{p.nama}</span>
                  <span className="block text-xs text-inkmuted mt-0.5">{p.jawatan}</span>
                </span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
