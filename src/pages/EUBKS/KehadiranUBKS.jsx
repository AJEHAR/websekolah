import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Star, Search } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKehadiranUBKSTahun, simpanKehadiranUBKS } from '../../hooks/useKehadiranUBKS.js'
import { todayISO } from '../../lib/dateUtils.js'
import PapanUBKS from './PapanUBKS.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]
const PERJUMPAAN_SENARAI = Array.from({ length: 12 }, (_, i) => i + 1)

export default function KehadiranUBKS() {
  const { user } = useOutletContext()
  const [tab, setTab] = useState('isi')

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('isi')}
          className="px-4 py-2 rounded-full text-xs font-medium border border-border"
          style={tab === 'isi' ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' } : { color: '#5C5C5C' }}
        >
          Isi Kehadiran
        </button>
        <button
          onClick={() => setTab('papan')}
          className="px-4 py-2 rounded-full text-xs font-medium border border-border"
          style={tab === 'papan' ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' } : { color: '#5C5C5C' }}
        >
          Papan Kehadiran
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
  const [unitDipilih, setUnitDipilih] = useState(null)
  const [kehadiran, setKehadiran] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [selesai, setSelesai] = useState(false)

  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kehadiranSenarai, muatSemula } = useKehadiranUBKSTahun(tahunSesi)

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  function pilihUnit(u) {
    setUnitDipilih(u)
    setSelesai(false)
    const rekodSediaAda = kehadiranSenarai.find((r) => r.unitId === u.id && r.perjumpaan === perjumpaan)
    if (rekodSediaAda) {
      const peta = {}
      rekodSediaAda.senaraiKehadiran.forEach((m) => { peta[m.idMurid] = m.hadir })
      setKehadiran(peta)
    } else {
      const peta = {}
      u.ahli.forEach((m) => { peta[m.idMurid] = true })
      setKehadiran(peta)
    }
  }

  function toggl(m) {
    const sedangHadir = kehadiran[m.idMurid] ?? true
    if (m.adalahLF && sedangHadir) {
      const ok = window.confirm(
        `${m.nama} murid Kefungsian Rendah (LF) - biasanya SENTIASA hadir.\n\nAnda pasti nak tanda TAK HADIR?`
      )
      if (!ok) return
    }
    setKehadiran((k) => ({ ...k, [m.idMurid]: !sedangHadir }))
  }

  async function hantar() {
    setMenyimpan(true)
    try {
      const senaraiKehadiran = unitDipilih.ahli.map((m) => ({
        idMurid: m.idMurid,
        nama: m.nama,
        hadir: Boolean(kehadiran[m.idMurid]),
        adalahLF: Boolean(m.adalahLF),
      }))
      await simpanKehadiranUBKS(tahunSesi, unitDipilih, perjumpaan, tarikh, senaraiKehadiran, user.uid)
      setSelesai(true)
      muatSemula()
    } finally {
      setMenyimpan(false)
    }
  }

  const jumlahHadir = unitDipilih ? unitDipilih.ahli.filter((m) => kehadiran[m.idMurid]).length : 0

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label htmlFor="tahunKehadiran" className="block text-xs font-medium text-ink mb-1">Tahun</label>
          <select
            id="tahunKehadiran"
            value={tahunSesi}
            onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDipilih(null) }}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
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
            onChange={(e) => { setPerjumpaan(Number(e.target.value)); setUnitDipilih(null) }}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            {PERJUMPAAN_SENARAI.map((p) => (
              <option key={p} value={p}>Perjumpaan {p}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tarikhUBKS" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
          <input
            id="tarikhUBKS"
            type="date"
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
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
      ) : (
        <div className="grid sm:grid-cols-2 gap-2 mb-5">
          {unitDitapis.map((u) => {
            const rekod = kehadiranSenarai.find((r) => r.unitId === u.id && r.perjumpaan === perjumpaan)
            const aktif = unitDipilih?.id === u.id
            return (
              <button
                key={u.id}
                onClick={() => pilihUnit(u)}
                className="text-left p-3 rounded-card bg-surface text-sm"
                style={{ border: `${aktif ? 2 : 1}px solid ${aktif ? '#C8102E' : rekod ? '#378ADD' : '#E5E5E5'}` }}
              >
                <p className="font-medium text-ink">{u.namaUnit}</p>
                <p className="text-xs text-inkmuted">{(u.ahli ?? []).length} ahli{rekod ? ' · Dah diisi' : ''}</p>
              </button>
            )
          })}
        </div>
      )}

      {unitDipilih && (
        <div className="p-4 rounded-card border border-border bg-surface">
          <p className="text-sm font-semibold text-ink mb-1">{unitDipilih.namaUnit} — Perjumpaan {perjumpaan}</p>
          <p className="text-xs text-inkmuted mb-4">
            {jumlahHadir} / {unitDipilih.ahli.length} hadir — tekan nama untuk tanda tak hadir
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {unitDipilih.ahli.map((m) => {
              const hadir = kehadiran[m.idMurid] ?? true
              return (
                <button
                  key={m.idMurid}
                  onClick={() => toggl(m)}
                  className="flex items-center gap-1.5 p-2.5 rounded-card text-left text-xs font-medium transition-colors"
                  style={{ backgroundColor: hadir ? '#EAF3DE' : '#F1EFE8', color: hadir ? '#27500A' : '#888780' }}
                >
                  {hadir && <Check size={14} className="shrink-0" />}
                  <span className="truncate flex-1">{m.nama}</span>
                  {m.adalahLF && <Star size={12} className="shrink-0 fill-current" style={{ color: '#F2C230' }} />}
                </button>
              )
            })}
          </div>

          {selesai && <p className="text-xs text-green-700 font-medium mb-3">Rekod kehadiran berjaya disimpan.</p>}

          <button
            onClick={hantar}
            disabled={menyimpan}
            className="w-full h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
          >
            {menyimpan ? 'Menyimpan…' : 'Submit Kehadiran'}
          </button>
        </div>
      )}
    </div>
  )
}
