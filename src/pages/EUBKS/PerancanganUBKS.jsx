import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Eye, Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import {
  muatkanPerancangan,
  senaraiDokUntukUnit,
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

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

  function progresUnit(unitId) {
    const dokUnit = perancanganTahun.filter((d) => d.unitId === unitId)
    const semuaEntri = dokUnit.flatMap((d) => d.senaraiPerjumpaan ?? [])
    return {
      adaPerancangan: dokUnit.length > 0,
      jumlahSelesai: semuaEntri.filter((e) => e.selesai).length,
      jumlahKeseluruhan: semuaEntri.length,
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {unitDitapis.map((u) => {
            const progres = progresUnit(u.id)
            return (
              <UnitPerancanganCard
                key={u.id}
                unit={u}
                kategoriLabel={labelKategori(u.kategoriUnit)}
                adaPerancangan={progres.adaPerancangan}
                jumlahSelesai={progres.jumlahSelesai}
                jumlahKeseluruhan={progres.jumlahKeseluruhan}
                onBuka={() => setUnitDipilih(u)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function JadualPerancangan({ unit, tahunSesi, user }) {
  const [dokSediaAda, setDokSediaAda] = useState([])
  const [mode, setMode] = useState(null)
  const [ikutTahun, setIkutTahun] = useState(false)
  const [tahunDarjah, setTahunDarjah] = useState('')
  const [rekod, setRekod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tapisStatus, setTapisStatus] = useState('semua')
  const [carianPerancangan, setCarianPerancangan] = useState('')
  const [barisEdit, setBarisEdit] = useState(null)
  const [barisLihat, setBarisLihat] = useState(null)

  const senaraiTahunDalamUnit = useMemo(() => {
    const set = new Set()
    ;(unit.ahli ?? []).forEach((m) => {
      if (m.tahunTingkatan) set.add(m.tahunTingkatan)
    })
    return [...set].sort()
  }, [unit])

  useEffect(() => {
    async function muat() {
      setLoading(true)
      const semua = await senaraiDokUntukUnit(unit.id)
      setDokSediaAda(semua)
      if (semua.length > 0) {
        setMode(semua[0].mode)
        setIkutTahun(semua[0].mode === 'asing')
      } else {
        setMode(null)
        setIkutTahun(false)
      }
      setTahunDarjah('')
      setLoading(false)
    }
    muat()
  }, [unit.id])

  useEffect(() => {
    async function muatRekod() {
      if (!mode) {
        setRekod(null)
        return
      }
      if (mode === 'asing' && !tahunDarjah) {
        setRekod(null)
        return
      }
      const d = await muatkanPerancangan(unit.id, mode, tahunDarjah)
      setRekod(d ?? { senaraiPerjumpaan: senaraiKosong() })
    }
    muatRekod()
  }, [mode, tahunDarjah, unit.id])

  function mulakan() {
    setMode(ikutTahun ? 'asing' : 'sama')
  }

  async function tukarBaris(index, dataBaru) {
    const senaraiBaru = [...rekod.senaraiPerjumpaan]
    senaraiBaru[index] = { ...senaraiBaru[index], ...dataBaru }
    await simpanPerancangan(unit.id, unit.namaUnit, tahunSesi, mode, tahunDarjah, senaraiBaru, user.uid)
    setRekod((r) => ({ ...r, senaraiPerjumpaan: senaraiBaru }))
    const semua = await senaraiDokUntukUnit(unit.id)
    setDokSediaAda(semua)
  }

  async function padamBaris(perjumpaan) {
    if (!window.confirm(`Padam kandungan perancangan Perjumpaan ${perjumpaan}? Ini akan kosongkan semula petak ni.`)) return
    const index = perjumpaan - 1
    await tukarBaris(index, { perancangan: '', tarikh: '', selesai: false, tarikhSelesai: null })
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  // Langkah 1: belum ada perancangan langsung - pilih mod dengan suis
  if (!mode) {
    return (
      <div className="p-5 rounded-card border border-border bg-surface">
        <p className="text-sm font-semibold text-ink mb-1">{unit.namaUnit}</p>
        <p className="text-xs text-inkmuted mb-4">Belum ada perancangan lagi. Sebelum mula, tetapkan satu perkara:</p>

        <div className="flex items-center justify-between p-3 rounded-card bg-base mb-4">
          <div>
            <p className="text-sm font-medium text-ink">Asingkan ikut Tahun/Darjah?</p>
            <p className="text-xs text-inkmuted">{ikutTahun ? 'Setiap darjah ada perancangan sendiri' : 'Satu perancangan untuk seluruh unit'}</p>
          </div>
          <button
            onClick={() => setIkutTahun((s) => !s)}
            role="switch"
            aria-checked={ikutTahun}
            className="relative h-7 w-12 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: ikutTahun ? '#C8102E' : '#E5E5E5' }}
          >
            <span
              className="absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow"
              style={{ transform: ikutTahun ? 'translateX(22px)' : 'translateX(4px)' }}
            />
          </button>
        </div>

        <button onClick={mulakan} className="w-full h-12 rounded-card bg-brand-red text-white text-sm font-semibold">
          Mula Perancangan
        </button>
      </div>
    )
  }

  if (mode === 'asing' && !tahunDarjah) {
    return (
      <div className="p-5 rounded-card border border-border bg-surface">
        <p className="text-sm font-semibold text-ink mb-1">{unit.namaUnit}</p>
        <p className="text-sm font-medium text-ink mb-3">Pilih Tahun/Darjah:</p>
        <div className="flex flex-wrap gap-2">
          {senaraiTahunDalamUnit.map((t) => (
            <button
              key={t}
              onClick={() => setTahunDarjah(t)}
              className="h-10 px-4 rounded-card border border-border bg-base text-sm font-medium text-ink hover:border-brand-red"
            >
              {t} {dokSediaAda.some((d) => d.tahunDarjah === t) && '✓'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!rekod) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  const senaraiDitapis = rekod.senaraiPerjumpaan.filter((b) => {
    if (tapisStatus === 'selesai' && !b.selesai) return false
    if (tapisStatus === 'belum' && b.selesai) return false
    if (carianPerancangan && !b.perancangan?.toLowerCase().includes(carianPerancangan.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-sm font-semibold text-ink">
          {unit.namaUnit} {mode === 'asing' && `— ${tahunDarjah}`}
        </p>
        {mode === 'asing' && (
          <div className="flex gap-1 flex-wrap">
            {senaraiTahunDalamUnit.map((t) => (
              <button
                key={t}
                onClick={() => setTahunDarjah(t)}
                className="h-8 px-3 rounded-full text-xs font-medium"
                style={{ backgroundColor: t === tahunDarjah ? '#1A1A1A' : '#F1EFE8', color: t === tahunDarjah ? '#fff' : '#5F5E5A' }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

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
        <table className="text-xs w-full">
          <thead className="bg-base">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-ink w-20">Bil Perjumpaan</th>
              <th className="text-left px-3 py-2 font-semibold text-ink">Perancangan</th>
              <th className="text-left px-3 py-2 font-semibold text-ink w-24">Tarikh</th>
              <th className="text-center px-3 py-2 font-semibold text-ink w-24">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {senaraiDitapis.map((b) => (
              <tr key={b.perjumpaan} style={b.selesai ? { backgroundColor: '#EAF3DE' } : undefined}>
                <td className="px-3 py-2 font-semibold text-ink align-top">{b.perjumpaan}</td>
                <td className="px-3 py-2 text-ink align-top">
                  <span className="line-clamp-2">{b.perancangan || <span className="text-inkmuted">Belum diisi</span>}</span>
                </td>
                <td className="px-3 py-2 text-inkmuted align-top whitespace-nowrap">{b.tarikh || '-'}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setBarisLihat(b)} aria-label="Lihat" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => setBarisEdit(b)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => padamBaris(b.perjumpaan)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                      <Trash2 size={14} />
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
