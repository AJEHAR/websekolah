import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Calendar, Users, ListChecks } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKehadiranUBKSTahun } from '../../hooks/useKehadiranUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { todayISO } from '../../lib/dateUtils.js'
import PapanUBKS from './PapanUBKS.jsx'
import UnitKehadiranCard from './UnitKehadiranCard.jsx'
import IsiKehadiranUBKSModal from './IsiKehadiranUBKSModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]
const PERJUMPAAN_SENARAI = Array.from({ length: 12 }, (_, i) => i + 1)

export default function KehadiranUBKS() {
  const { user } = useOutletContext()
  const [tab, setTab] = useState('isi')

  return (
    <div>
      <div className="flex gap-2 mb-6 p-1 rounded-full bg-base w-fit">
        <button
          onClick={() => setTab('isi')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
          style={tab === 'isi' ? { backgroundColor: '#C8102E', color: '#fff' } : { color: '#5C5C5C' }}
        >
          <ListChecks size={14} /> Isi Kehadiran
        </button>
        <button
          onClick={() => setTab('papan')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
          style={tab === 'papan' ? { backgroundColor: '#C8102E', color: '#fff' } : { color: '#5C5C5C' }}
        >
          <Users size={14} /> Papan Kehadiran
        </button>
      </div>

      {tab === 'isi' ? <IsiKehadiran user={user} /> : <PapanUBKS />}
    </div>
  )
}

function IsiKehadiran({ user }) {
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const [perjumpaan, setPerjumpaan] = useState(1)
  const [tarikh, setTarikh] = useState(todayISO())
  const [carian, setCarian] = useState('')
  const [unitDibuka, setUnitDibuka] = useState(null)

  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kehadiranSenarai, muatSemula } = useKehadiranUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

  function rekodUntuk(u) {
    return kehadiranSenarai.find((r) => r.unitId === u.id && r.perjumpaan === perjumpaan)
  }

  return (
    <div>
      <div className="p-4 rounded-card border border-border bg-surface mb-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="tahunKehadiran" className="block text-xs font-medium text-ink mb-1">Tahun</label>
            <select
              id="tahunKehadiran"
              value={tahunSesi}
              onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDibuka(null) }}
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            >
              {PILIHAN_TAHUN.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="perjumpaan" className="block text-xs font-medium text-ink mb-1">Perjumpaan</label>
            <select
              id="perjumpaan"
              value={perjumpaan}
              onChange={(e) => { setPerjumpaan(Number(e.target.value)); setUnitDibuka(null) }}
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            >
              {PERJUMPAAN_SENARAI.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tarikhUBKS" className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
              <Calendar size={12} /> Tarikh
            </label>
            <input
              id="tarikhUBKS"
              type="date"
              value={tarikh}
              onChange={(e) => setTarikh(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            />
          </div>
        </div>
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

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitDitapis.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit dijumpai.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {unitDitapis.map((u) => (
            <UnitKehadiranCard
              key={u.id}
              unit={u}
              rekod={rekodUntuk(u)}
              kategoriLabel={labelKategori(u.kategoriUnit)}
              onBuka={() => setUnitDibuka(u)}
            />
          ))}
        </div>
      )}

      <IsiKehadiranUBKSModal
        key={unitDibuka?.id ?? 'kosong'}
        unit={unitDibuka}
        rekod={unitDibuka ? rekodUntuk(unitDibuka) : null}
        tahunSesi={tahunSesi}
        perjumpaan={perjumpaan}
        tarikh={tarikh}
        user={user}
        onClose={() => setUnitDibuka(null)}
        onSelesai={() => { setUnitDibuka(null); muatSemula() }}
      />
    </div>
  )
}
