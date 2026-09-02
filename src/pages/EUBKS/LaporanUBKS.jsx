import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ChevronDown, Users, FileText, Printer, Settings } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { useCetak } from '../../hooks/useCetak.js'
import { senaraiLaporanUnit } from '../../hooks/useLaporanUBKS.js'
import { usePikebm } from '../../hooks/usePikebm.js'
import { kumpulUnitIkutKategori } from './kumpulUnitIkutKategori.js'
import CetakLaporanUBKS from './CetakLaporanUBKS.jsx'
import UrusPikebmModal from './UrusPikebmModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]
const SEMUA_PERJUMPAAN = Array.from({ length: 12 }, (_, i) => i + 1)

// Sub-page "Laporan UBKS" - unit dikumpul ikut KATEGORI (Unit Beruniform/
// Kelab/Sukan/dll - lihat kumpulUnitIkutKategori.js, sama corak dikongsi
// dengan Murid UBKS & Jawatankuasa UBKS). Buka unit -> 12 slot Bil.
// Perjumpaan (sepadan Perancangan & Kehadiran). Isi Laporan buka HALAMAN
// PENUH (/eubks/laporan-ubks/:unitId/:perjumpaan), bukan popup lagi.
export default function LaporanUBKS() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const { senarai: senaraiPikebm, muatSemula: muatSemulaPikebm } = usePikebm()
  const [dataCetak, setDataCetak] = useCetak()

  const [unitDibuka, setUnitDibuka] = useState(null)
  const [statusLaporan, setStatusLaporan] = useState({})
  const [memuatkanStatus, setMemuatkanStatus] = useState(false)
  const [tunjukPikebm, setTunjukPikebm] = useState(false)

  const kumpulan = kumpulUnitIkutKategori(unitSenarai, kategoriSenarai)

  // Ambil bilangan laporan untuk SEMUA unit terus bila page load (bukan
  // tunggu staff klik buka satu-satu) - kalau tidak, "X/12 laporan diisi"
  // akan tunjuk "0/12" PALSU untuk semua unit sebelum dibuka (mengelirukan
  // staff yang scan senarai pantas, ingat semua unit belum ada laporan
  // langsung walhal dah ada).
  useEffect(() => {
    if (unitSenarai.length === 0) return
    let batal = false
    setMemuatkanStatus(true)
    ;(async () => {
      const hasil = await Promise.all(
        unitSenarai.map(async (unit) => {
          const senarai = await senaraiLaporanUnit(unit.tahunSesi, unit.id)
          const peta = {}
          senarai.forEach((r) => { peta[r.perjumpaan] = r })
          return [unit.id, peta]
        })
      )
      if (batal) return
      setStatusLaporan(Object.fromEntries(hasil))
      setMemuatkanStatus(false)
    })()
    return () => { batal = true }
  }, [unitSenarai])

  function bukaUnit(unit) {
    setUnitDibuka(unitDibuka === unit.id ? null : unit.id)
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
        <div className="space-y-6">
          {kumpulan.map((kump) => (
            <div key={kump.kod}>
              <h3 className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">{kump.label} <span className="font-normal normal-case">({kump.units.length})</span></h3>
              <div className="space-y-2.5">
                {kump.units.map((unit) => {
                  const dibuka = unitDibuka === unit.id
                  const peta = statusLaporan[unit.id] ?? {}
                  const bilangan = Object.keys(peta).length
                  return (
                    <div key={unit.id} className="border border-border rounded-card overflow-hidden">
                      <button onClick={() => bukaUnit(unit)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-base">
                        <Users size={16} className="text-inkmuted shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
                          <p className="text-xs text-inkmuted">{memuatkanStatus ? 'Memuatkan…' : `${bilangan}/12 laporan diisi`}</p>
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
                                    onClick={() => navigate(`/eubks/laporan-ubks/${unit.id}/${p}`)}
                                    className="h-14 rounded-card border flex flex-col items-center justify-center gap-0.5"
                                    style={adaLaporan
                                      ? { borderColor: '#0F6E56', backgroundColor: '#E1F5EE', color: '#0F6E56' }
                                      : { borderColor: '#E5E5E5', color: '#5C5C5C' }}
                                  >
                                    <FileText size={14} />
                                    <span className="text-[11px] font-semibold">Bil. {p}</span>
                                  </button>
                                  {/* Ruang butang Cetak sentiasa disediakan (kelihatan/tersembunyi)
                                      supaya SEMUA petak sama tinggi - elak grid nampak "berombak"
                                      antara petak yang ada/tiada laporan. */}
                                  <button
                                    onClick={() => cetakTerus(unit, p)}
                                    className={`flex items-center justify-center gap-1 h-7 rounded-card border border-border text-[10px] text-inkmuted ${adaLaporan ? '' : 'invisible'}`}
                                  >
                                    <Printer size={11} /> Cetak
                                  </button>
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
            </div>
          ))}
        </div>
      )}

      <UrusPikebmModal open={tunjukPikebm} senarai={senaraiPikebm} onClose={() => setTunjukPikebm(false)} onSelesai={muatSemulaPikebm} />

      {dataCetak && <CetakLaporanUBKS data={dataCetak.data} unit={dataCetak.unit} perjumpaan={dataCetak.perjumpaan} />}
    </div>
  )
}
