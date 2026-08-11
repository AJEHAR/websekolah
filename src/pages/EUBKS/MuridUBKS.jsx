import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun, tambahUnit } from '../../hooks/useUnitUBKS.js'
import UnitUBKSModal from './UnitUBKSModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function MuridUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading, muatSemula } = useUnitUBKSTahun(tahunSesi)

  const [tunjukTambah, setTunjukTambah] = useState(false)
  const [namaBaru, setNamaBaru] = useState('')
  const [unitDipilih, setUnitDipilih] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  async function tambah(e) {
    e.preventDefault()
    if (!namaBaru.trim()) return
    setMenyimpan(true)
    try {
      await tambahUnit(tahunSesi, namaBaru.trim(), user.uid)
      setNamaBaru('')
      setTunjukTambah(false)
      muatSemula()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="max-w-[140px]">
          <label htmlFor="tahunSesi" className="block text-xs font-medium text-ink mb-1">Tahun</label>
          <select
            id="tahunSesi"
            value={tahunSesi}
            onChange={(e) => setTahunSesi(Number(e.target.value))}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            {PILIHAN_TAHUN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {adaSeksyen('ubks') && (
          <button
            onClick={() => setTunjukTambah((s) => !s)}
            className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
          >
            <Plus size={14} /> Tambah Unit
          </button>
        )}
      </div>

      {tunjukTambah && (
        <form onSubmit={tambah} className="flex gap-2 mb-5">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama unit (contoh: Pengakap)…"
            className="flex-1 min-w-0 h-11 px-3 rounded-card border border-border bg-surface text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={menyimpan}
            className="h-11 px-4 rounded-card bg-ink text-white text-sm font-semibold disabled:opacity-60"
          >
            {menyimpan ? '…' : 'Cipta'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitSenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {unitSenarai.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnitDipilih(u)}
              className="text-left p-4 rounded-card border border-border bg-surface hover:border-brand-red transition-colors flex items-center gap-3"
            >
              <div className="h-12 w-12 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
                {u.gambarUnit ? (
                  <img src={u.gambarUnit} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Users size={18} className="text-inkmuted" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{u.namaUnit}</p>
                <p className="text-xs text-inkmuted">{(u.ahli ?? []).length} ahli</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <UnitUBKSModal
        key={unitDipilih?.id ?? 'kosong'}
        unit={unitDipilih}
        isAdmin={adaSeksyen('ubks')}
        user={user}
        onClose={() => setUnitDipilih(null)}
        onSelesai={muatSemula}
      />
    </div>
  )
}
