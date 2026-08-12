import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Eye, Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import {
  muatkanPerancangan,
  simpanPerancangan,
  senaraiKosong,
  useSenaraiPerancanganTahun,
} from '../../hooks/usePerancanganUBKS.js'
import UnitPerancanganCard from './UnitPerancanganCard.jsx'
import PerancanganModal from './PerancanganModal.jsx'
import PerancanganDetailModal from './PerancanganDetailModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function PerancanganUBKS() {
  const { user } = useOutletContext()
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const { senarai: perancanganTahun, loading: loadingPerancangan, muatSemula: muatSemulaPerancangan } = useSenaraiPerancanganTahun(tahunSesi)
  const [carian, setCarian] = useState('')
  const [unitDipilih, setUnitDipilih] = useState(null)

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  function progresUnit(unitId) {
    const dok = perancanganTahun.find((d) => d.unitId === unitId)
    const senarai = dok?.senaraiPerjumpaan ?? []
    return {
      adaPerancangan: Boolean(dok),
      jumlahSelesai: senarai.filter((e) => e.selesai).length,
      jumlahKeseluruhan: senarai.length,
    }
  }

  if (unitDipilih) {
    return (
      <div>
        <button
          onClick={() => { setUnitDipilih(null); muatSemulaPerancangan() }}
          className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4"
        >
          <ChevronLeft size={14} /> Kembali ke senarai unit
        </button>
        <JadualPerancangan unit={unitDipilih} tahunSesi={tahunSesi} user={user} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-end">
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
        <div className="relative flex-1 min-w-[160px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Cari nama unit…"
            className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
      </div>

      {loading || loadingPerancangan ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitDitapis.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit dijumpai.</p>
      ) : (
        <div className="space-y-6">
          {senaraiKategoriSusun(unitDitapis, kategoriSenarai).map(({ kategori, unitSenaraiKategori }) => (
            <section key={kategori.kod}>
              <h2 className="text-sm font-semibold text-ink mb-3">
                {kategori.nama} <span className="text-inkmuted font-normal">({unitSenaraiKategori.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {unitSenaraiKategori.map((u) => {
                  const progres = progresUnit(u.id)
                  return (
                    <UnitPerancanganCard
                      key={u.id}
                      unit={u}
                      adaPerancangan={progres.adaPerancangan}
                      jumlahSelesai={progres.jumlahSelesai}
                      jumlahKeseluruhan={progres.jumlahKeseluruhan}
                      onBuka={() => setUnitDipilih(u)}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

// Kumpul unit ikut kategori (susun ikut turutan kategori yang ditetapkan admin),
// dengan seksyen "Lain-lain" di akhir untuk unit tanpa kategori sepadan.
function senaraiKategoriSusun(unitSenarai, kategoriSenarai) {
  const hasil = []
  kategoriSenarai.forEach((kategori) => {
    const unitSenaraiKategori = unitSenarai.filter((u) => u.kategoriUnit === kategori.kod)
    if (unitSenaraiKategori.length > 0) hasil.push({ kategori, unitSenaraiKategori })
  })
  const kodDiketahui = new Set(kategoriSenarai.map((k) => k.kod))
  const unitLain = unitSenarai.filter((u) => !kodDiketahui.has(u.kategoriUnit))
  if (unitLain.length > 0) {
    hasil.push({ kategori: { kod: 'LAIN', nama: 'Lain-lain' }, unitSenaraiKategori: unitLain })
  }
  return hasil
}

function JadualPerancangan({ unit, tahunSesi, user }) {
  const [rekod, setRekod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tapisStatus, setTapisStatus] = useState('semua')
  const [carianPerancangan, setCarianPerancangan] = useState('')
  const [barisEdit, setBarisEdit] = useState(null)
  const [barisLihat, setBarisLihat] = useState(null)

  useEffect(() => {
    async function muat() {
      setLoading(true)
      const d = await muatkanPerancangan(unit.id)
      setRekod(d ?? { senaraiPerjumpaan: senaraiKosong() })
      setLoading(false)
    }
    muat()
  }, [unit.id])

  async function tukarBaris(index, dataBaru) {
    const senaraiBaru = [...rekod.senaraiPerjumpaan]
    senaraiBaru[index] = { ...senaraiBaru[index], ...dataBaru }
    await simpanPerancangan(unit.id, unit.namaUnit, tahunSesi, senaraiBaru, user.uid)
    setRekod((r) => ({ ...r, senaraiPerjumpaan: senaraiBaru }))
  }

  async function padamBaris(perjumpaan) {
    if (!window.confirm(`Padam kandungan perancangan Perjumpaan ${perjumpaan}? Ini akan kosongkan semula petak ni.`)) return
    await tukarBaris(perjumpaan - 1, { perancangan: '', tarikh: '', selesai: false, tarikhSelesai: null })
  }

  if (loading || !rekod) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  const senaraiDitapis = rekod.senaraiPerjumpaan.filter((b) => {
    if (tapisStatus === 'selesai' && !b.selesai) return false
    if (tapisStatus === 'belum' && b.selesai) return false
    if (carianPerancangan && !b.perancangan?.toLowerCase().includes(carianPerancangan.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <p className="text-sm font-semibold text-ink mb-3">{unit.namaUnit}</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={carianPerancangan}
          onChange={(e) => setCarianPerancangan(e.target.value)}
          placeholder="Cari kandungan perancangan…"
          className="flex-1 min-w-[160px] h-10 px-3 rounded-card border border-border bg-surface text-sm"
        />
        <select
          value={tapisStatus}
          onChange={(e) => setTapisStatus(e.target.value)}
          className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="semua">Semua Status</option>
          <option value="selesai">Selesai Sahaja</option>
          <option value="belum">Belum Selesai Sahaja</option>
        </select>
      </div>

      <div className="border border-border rounded-card overflow-hidden">
        <table className="text-xs w-full table-fixed">
          <thead className="bg-base">
            <tr>
              <th className="text-left px-2 py-2 font-semibold text-ink w-10">Bil</th>
              <th className="text-left px-2 py-2 font-semibold text-ink">Perancangan</th>
              <th className="hidden sm:table-cell text-left px-2 py-2 font-semibold text-ink w-24">Tarikh Selesai</th>
              <th className="text-center px-1 py-2 font-semibold text-ink w-[72px]">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {senaraiDitapis.map((b) => (
              <tr key={b.perjumpaan} style={b.selesai ? { backgroundColor: '#EAF3DE' } : undefined}>
                <td className="px-2 py-2 font-semibold text-ink">{b.perjumpaan}</td>
                <td className="px-2 py-2 text-ink truncate">
                  {b.perancangan || <span className="text-inkmuted">Belum diisi</span>}
                </td>
                <td className="hidden sm:table-cell px-2 py-2 text-inkmuted whitespace-nowrap">{b.tarikhSelesai || '-'}</td>
                <td className="px-1 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <button onClick={() => setBarisLihat(b)} aria-label="Lihat" className="p-1 rounded-card hover:bg-base text-inkmuted">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => setBarisEdit(b)} aria-label="Edit" className="p-1 rounded-card hover:bg-base text-inkmuted">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => padamBaris(b.perjumpaan)} aria-label="Padam" className="p-1 rounded-card hover:bg-base text-brand-red">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PerancanganModal
        baris={barisEdit}
        onClose={() => setBarisEdit(null)}
        onSimpan={async (dataBaru) => { await tukarBaris(barisEdit.perjumpaan - 1, dataBaru); setBarisEdit(null) }}
      />

      <PerancanganDetailModal
        baris={barisLihat}
        onClose={() => setBarisLihat(null)}
        onTandaSelesai={async (tarikhSelesai) => {
          await tukarBaris(barisLihat.perjumpaan - 1, { selesai: true, tarikhSelesai })
          setBarisLihat((b) => ({ ...b, selesai: true, tarikhSelesai }))
        }}
        onBatalSelesai={async () => {
          await tukarBaris(barisLihat.perjumpaan - 1, { selesai: false, tarikhSelesai: null })
          setBarisLihat((b) => ({ ...b, selesai: false, tarikhSelesai: null }))
        }}
      />
    </div>
  )
}
