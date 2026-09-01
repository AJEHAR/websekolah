import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronDown, Users, FileText, Printer, Settings } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useCetak } from '../../hooks/useCetak.js'
import { senaraiLaporanUnit } from '../../hooks/useLaporanUBKS.js'
import { usePikebm } from '../../hooks/usePikebm.js'
import LaporanUBKSForm from './LaporanUBKSForm.jsx'
import CetakLaporanUBKS from './CetakLaporanUBKS.jsx'
import UrusPikebmModal from './UrusPikebmModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]
const SEMUA_PERJUMPAAN = Array.from({ length: 12 }, (_, i) => i + 1)

// Sub-page "Laporan UBKS" - senarai unit (macam Jawatankuasa UBKS), buka
// satu unit -> 12 slot Bil. Perjumpaan (sepadan dengan Perancangan &
// Kehadiran UBKS yang guna nombor sama). Slot yang dah ada laporan
// ditanda hijau + boleh cetak terus.
export default function LaporanUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: senaraiPikebm, muatSemula: muatSemulaPikebm } = usePikebm()
  const [dataCetak, setDataCetak] = useCetak()

  const [unitDibuka, setUnitDibuka] = useState(null)
  const [statusLaporan, setStatusLaporan] = useState({}) // { [unitId]: { [perjumpaan]: rekod } }
  const [formDibuka, setFormDibuka] = useState(null) // { unit, perjumpaan }
  const [tunjukPikebm, setTunjukPikebm] = useState(false)

  async function bukaUnit(unit) {
    if (unitDibuka === unit.id) {
      setUnitDibuka(null)
      return
    }
    setUnitDibuka(unit.id)
    if (!statusLaporan[unit.id]) {
      const senarai = await senaraiLaporanUnit(unit.tahunSesi, unit.id)
      const peta = {}
      senarai.forEach((r) => { peta[r.perjumpaan] = r })
      setStatusLaporan((s) => ({ ...s, [unit.id]: peta }))
    }
  }

  async function selepasSimpan(unit) {
    const senarai = await senaraiLaporanUnit(unit.tahunSesi, unit.id)
    const peta = {}
    senarai.forEach((r) => { peta[r.perjumpaan] = r })
    setStatusLaporan((s) => ({ ...s, [unit.id]: peta }))
  }

  function cetakDariBorang(data) {
    setDataCetak({ data, unit: formDibuka.unit, perjumpaan: formDibuka.perjumpaan })
  }

  function cetakTerus(unit, perjumpaan) {
    const rekod = statusLaporan[unit.id]?.[perjumpaan]
    if (!rekod) return
    setDataCetak({ data: rekod, unit, perjumpaan })
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="max-w-[140px]">
          <label htmlFor="tahunSesi" className="block text-xs font-medium text-ink mb-1">Tahun</label>
          <select
            id="tahunSesi"
            value={tahunSesi}
            onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDibuka(null) }}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            {PILIHAN_TAHUN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button onClick={() => setTunjukPikebm(true)} className="h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1.5">
            <Settings size={14} /> Senarai PIKeBM
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitSenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="space-y-2.5">
          {unitSenarai.map((unit) => {
            const dibuka = unitDibuka === unit.id
            const peta = statusLaporan[unit.id] ?? {}
            const bilangan = Object.keys(peta).length
            return (
              <div key={unit.id} className="border border-border rounded-card overflow-hidden">
                <button onClick={() => bukaUnit(unit)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-base">
                  <Users size={16} className="text-inkmuted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
                    <p className="text-xs text-inkmuted">{bilangan}/12 laporan diisi</p>
                  </div>
                  <ChevronDown size={16} className={`text-inkmuted shrink-0 transition-transform ${dibuka ? 'rotate-180' : ''}`} />
                </button>

                {dibuka && (
                  <div className="border-t border-border p-3.5">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {SEMUA_PERJUMPAAN.map((p) => {
                        const adaLaporan = Boolean(peta[p])
                        return (
                          <div key={p} className="flex flex-col gap-1">
                            <button
                              onClick={() => setFormDibuka({ unit, perjumpaan: p })}
                              className="h-14 rounded-card border flex flex-col items-center justify-center gap-0.5"
                              style={adaLaporan
                                ? { borderColor: '#0F6E56', backgroundColor: '#E1F5EE', color: '#0F6E56' }
                                : { borderColor: '#E5E5E5', color: '#5C5C5C' }}
                            >
                              <FileText size={14} />
                              <span className="text-[11px] font-semibold">Bil. {p}</span>
                            </button>
                            {adaLaporan && (
                              <button onClick={() => cetakTerus(unit, p)} className="flex items-center justify-center gap-1 h-7 rounded-card border border-border text-[10px] text-inkmuted">
                                <Printer size={11} /> Cetak
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {formDibuka && (
        <LaporanUBKSForm
          open={Boolean(formDibuka)}
          unit={formDibuka.unit}
          perjumpaan={formDibuka.perjumpaan}
          user={user}
          onClose={() => setFormDibuka(null)}
          onSelesai={() => { selepasSimpan(formDibuka.unit); setFormDibuka(null) }}
          onCetak={cetakDariBorang}
        />
      )}

      <UrusPikebmModal open={tunjukPikebm} senarai={senaraiPikebm} onClose={() => setTunjukPikebm(false)} onSelesai={muatSemulaPikebm} />

      {dataCetak && <CetakLaporanUBKS data={dataCetak.data} unit={dataCetak.unit} perjumpaan={dataCetak.perjumpaan} />}
    </div>
  )
}
