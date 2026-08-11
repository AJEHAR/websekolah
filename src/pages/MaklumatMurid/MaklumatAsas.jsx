import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Search } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useMuridList } from '../../hooks/useMurid.js'
import ImportXlsxModal from './ImportXlsxModal.jsx'
import MuridDetailModal from './MuridDetailModal.jsx'

export default function MaklumatAsas() {
  const { user } = useOutletContext()
  const { isAdmin } = useIsAdmin(user)
  const { senarai, loading, muatSemula } = useMuridList()

  const [carian, setCarian] = useState('')
  const [tunjukImport, setTunjukImport] = useState(false)
  const [muridLihat, setMuridLihat] = useState(null)

  const disenarai = senarai.filter((m) =>
    `${m.nama ?? ''} ${m.namaKelas ?? ''} ${m.noPengenalan ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-inkmuted">{senarai.length} murid berdaftar</p>
        {isAdmin && (
          <button
            onClick={() => setTunjukImport(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-red px-3 py-2 rounded-card shrink-0"
          >
            <Upload size={14} /> Import XLSX
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama, kelas atau no. pengenalan…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">
          {senarai.length === 0 ? 'Tiada murid lagi - admin boleh import fail XLSX.' : 'Tiada murid dijumpai.'}
        </p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((m) => (
            <button
              key={m.id}
              onClick={() => setMuridLihat(m)}
              className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-card border border-border bg-surface hover:border-brand-red transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{m.nama}</p>
                <p className="text-xs text-inkmuted truncate">{m.namaKelas} · {m.tahunTingkatan} · {m.noPengenalan}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <ImportXlsxModal
        open={tunjukImport}
        onClose={() => setTunjukImport(false)}
        user={user}
        senaraiSediaAda={senarai}
        onSelesai={muatSemula}
      />
      <MuridDetailModal murid={muridLihat} onClose={() => setMuridLihat(null)} />
    </div>
  )
}
