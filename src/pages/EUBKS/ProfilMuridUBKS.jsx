import { useState } from 'react'
import { Search, User } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import ProfilMuridUBKSModal from './ProfilMuridUBKSModal.jsx'

// Sub-page KOKU berasingan - senarai SEMUA murid (bukan ikut satu unit),
// cari nama, tekan untuk buka Profil UBKS dia (unit disertai, jawatankuasa,
// peratus kehadiran setiap unit - lihat ProfilMuridUBKSModal.jsx).
export default function ProfilMuridUBKS() {
  const { senarai: muridSenarai, loading } = useMuridList()
  const [carian, setCarian] = useState('')
  const [profilDibuka, setProfilDibuka] = useState(null)

  const disenarai = muridSenarai.filter((m) => (m.nama ?? '').toLowerCase().includes(carian.toLowerCase()))

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama murid…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">{carian ? 'Tiada murid sepadan dengan carian.' : 'Tiada murid direkodkan lagi.'}</p>
      ) : (
        <div className="border border-border rounded-card divide-y divide-border overflow-hidden">
          {disenarai.map((m) => (
            <button
              key={m.id}
              onClick={() => setProfilDibuka({ idMurid: m.idMurid, nama: m.nama })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-base"
            >
              <div className="h-8 w-8 rounded-full bg-base flex items-center justify-center shrink-0">
                <User size={14} className="text-inkmuted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{m.nama}</p>
                {m.tahunTingkatan && <p className="text-[11px] text-inkmuted">{m.tahunTingkatan}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <ProfilMuridUBKSModal
        open={Boolean(profilDibuka)}
        idMurid={profilDibuka?.idMurid}
        nama={profilDibuka?.nama}
        onClose={() => setProfilDibuka(null)}
      />
    </div>
  )
}
