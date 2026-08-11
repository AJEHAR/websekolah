import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import {
  muatkanPerancangan,
  senaraiDokUntukUnit,
  simpanPerancangan,
  senaraiKosong,
} from '../../hooks/usePerancanganUBKS.js'
import PerancanganModal from './PerancanganModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function PerancanganUBKS() {
  const { user } = useOutletContext()
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const [carian, setCarian] = useState('')
  const [unitDipilih, setUnitDipilih] = useState(null)

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div className="max-w-[140px]">
          <label htmlFor="tahunSesi" className="block text-xs font-medium text-ink mb-1">Tahun</label>
          <select
            id="tahunSesi"
            value={tahunSesi}
            onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDipilih(null) }}
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

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2 mb-5">
          {unitDitapis.map((u) => {
            const aktif = unitDipilih?.id === u.id
            return (
              <button
                key={u.id}
                onClick={() => setUnitDipilih(u)}
                className="text-left p-3 rounded-card bg-surface text-sm"
                style={{ border: `${aktif ? 2 : 1}px solid ${aktif ? '#C8102E' : '#E5E5E5'}` }}
              >
                <p className="font-medium text-ink">{u.namaUnit}</p>
                <p className="text-xs text-inkmuted">{(u.ahli ?? []).length} ahli</p>
              </button>
            )
          })}
        </div>
      )}

      {unitDipilih && <JadualPerancangan unit={unitDipilih} tahunSesi={tahunSesi} user={user} />}
    </div>
  )
}

function JadualPerancangan({ unit, tahunSesi, user }) {
  const [dokSediaAda, setDokSediaAda] = useState([])
  const [mode, setMode] = useState(null)
  const [tahunDarjah, setTahunDarjah] = useState('')
  const [rekod, setRekod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tapisStatus, setTapisStatus] = useState('semua')
  const [carianPerancangan, setCarianPerancangan] = useState('')
  const [barisEdit, setBarisEdit] = useState(null)

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
        setTahunDarjah(semua[0].mode === 'asing' ? '' : '')
      } else {
        setMode(null)
        setTahunDarjah('')
      }
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

  async function tukarBaris(index, dataBaru) {
    const senaraiBaru = [...rekod.senaraiPerjumpaan]
    senaraiBaru[index] = { ...senaraiBaru[index], ...dataBaru }
    await simpanPerancangan(unit.id, unit.namaUnit, tahunSesi, mode, tahunDarjah, senaraiBaru, user.uid)
    setRekod((r) => ({ ...r, senaraiPerjumpaan: senaraiBaru }))
    const semua = await senaraiDokUntukUnit(unit.id)
    setDokSediaAda(semua)
    setBarisEdit(null)
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  if (!mode) {
    return (
      <div className="p-4 rounded-card border border-border bg-base">
        <p className="text-sm font-medium text-ink mb-3">Perancangan untuk "{unit.namaUnit}" belum wujud. Pilih mod:</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setMode('sama')} className="flex-1 min-w-[160px] h-11 rounded-card border border-border bg-surface text-sm font-medium text-ink hover:border-brand-red">
            Sama untuk semua Tahun/Darjah
          </button>
          <button onClick={() => setMode('asing')} className="flex-1 min-w-[160px] h-11 rounded-card border border-border bg-surface text-sm font-medium text-ink hover:border-brand-red">
            Asingkan ikut Tahun/Darjah
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'asing' && !tahunDarjah) {
    return (
      <div className="p-4 rounded-card border border-border bg-base">
        <p className="text-sm font-medium text-ink mb-3">Pilih Tahun/Darjah untuk perancangan:</p>
        <div className="flex flex-wrap gap-2">
          {senaraiTahunDalamUnit.map((t) => (
            <button
              key={t}
              onClick={() => setTahunDarjah(t)}
              className="h-10 px-4 rounded-card border border-border bg-surface text-sm font-medium text-ink hover:border-brand-red"
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
              <th className="text-left px-3 py-2 font-semibold text-ink w-24">Bil Perjumpaan</th>
              <th className="text-left px-3 py-2 font-semibold text-ink">Perancangan</th>
              <th className="text-left px-3 py-2 font-semibold text-ink w-28">Tarikh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {senaraiDitapis.map((b) => (
              <tr
                key={b.perjumpaan}
                onClick={() => setBarisEdit(b)}
                className="cursor-pointer hover:opacity-80"
                style={b.selesai ? { backgroundColor: '#EAF3DE' } : undefined}
              >
                <td className="px-3 py-2 font-semibold text-ink align-top">{b.perjumpaan}</td>
                <td className="px-3 py-2 text-ink whitespace-pre-wrap align-top">
                  {b.perancangan || <span className="text-inkmuted">Belum diisi</span>}
                </td>
                <td className="px-3 py-2 text-inkmuted align-top whitespace-nowrap">{b.tarikh || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PerancanganModal
        baris={barisEdit}
        onClose={() => setBarisEdit(null)}
        onSimpan={(dataBaru) => tukarBaris(barisEdit.perjumpaan - 1, dataBaru)}
      />
    </div>
  )
}
