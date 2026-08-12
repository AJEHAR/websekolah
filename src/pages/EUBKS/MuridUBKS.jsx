import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Users, Search } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun, tambahUnit } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import UnitUBKSModal from './UnitUBKSModal.jsx'

function AvatarUnit({ gambarUnit }) {
  const [gagal, setGagal] = useState(false)
  return (
    <div className="h-12 w-12 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
      {gambarUnit && !gagal ? (
        <img src={gambarUnit} alt="" className="h-full w-full object-cover" onError={() => setGagal(true)} />
      ) : (
        <Users size={18} className="text-inkmuted" />
      )}
    </div>
  )
}

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function MuridUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading, muatSemula } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const [tunjukTambah, setTunjukTambah] = useState(false)
  const [namaBaru, setNamaBaru] = useState('')
  const [kategoriBaru, setKategoriBaru] = useState('')
  const [unitDipilih, setUnitDipilih] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)
  const [carian, setCarian] = useState('')

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  async function tambah(e) {
    e.preventDefault()
    setRalat(null)
    if (!namaBaru.trim()) {
      setRalat('Sila isi nama unit.')
      return
    }
    if (!kategoriBaru) {
      setRalat('Sila pilih kategori unit.')
      return
    }
    setMenyimpan(true)
    try {
      await tambahUnit(tahunSesi, namaBaru.trim(), kategoriBaru, user.uid)
      setNamaBaru('')
      setKategoriBaru('')
      setTunjukTambah(false)
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal cipta unit.')
    } finally {
      setMenyimpan(false)
    }
  }

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
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

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama unit…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {tunjukTambah && (
        <form onSubmit={tambah} className="flex flex-wrap gap-2 mb-5 p-3 rounded-card border border-border bg-base">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama unit (contoh: Pengakap)…"
            className="flex-1 min-w-0 h-11 px-3 rounded-card border border-border bg-surface text-sm"
            autoFocus
          />
          <select
            value={kategoriBaru}
            onChange={(e) => setKategoriBaru(e.target.value)}
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            <option value="">-- Kategori --</option>
            {kategoriSenarai.map((k) => (
              <option key={k.id} value={k.kod}>{k.nama}</option>
            ))}
          </select>
          <button type="submit" disabled={menyimpan} className="h-11 px-4 rounded-card bg-ink text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? '…' : 'Cipta'}
          </button>
          {ralat && <p className="text-xs text-brand-red w-full">{ralat}</p>}
        </form>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitDitapis.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {unitDitapis.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnitDipilih(u)}
              className="text-left p-4 rounded-card border border-border bg-surface hover:border-brand-red transition-colors flex items-center gap-3"
            >
              <AvatarUnit gambarUnit={u.gambarUnit} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{u.namaUnit}</p>
                <p className="text-xs text-inkmuted truncate">{labelKategori(u.kategoriUnit)} · {(u.ahli ?? []).length} ahli</p>
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
