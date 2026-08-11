import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Star, Search, Calendar, Users, CheckCircle2, XCircle, ListChecks } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKehadiranUBKSTahun, simpanKehadiranUBKS } from '../../hooks/useKehadiranUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
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
  const [unitDipilih, setUnitDipilih] = useState(null)
  const [kehadiran, setKehadiran] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [selesai, setSelesai] = useState(false)

  const { senarai: unitSenarai, loading } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kehadiranSenarai, muatSemula } = useKehadiranUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const unitDitapis = unitSenarai.filter((u) => u.namaUnit?.toLowerCase().includes(carian.toLowerCase()))

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

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

  const ahliIkutTahun = useMemo(() => {
    if (!unitDipilih) return {}
    const kumpulan = {}
    unitDipilih.ahli.forEach((m) => {
      const t = m.tahunTingkatan || 'Tiada Tahun'
      if (!kumpulan[t]) kumpulan[t] = []
      kumpulan[t].push(m)
    })
    return kumpulan
  }, [unitDipilih])

  const jumlahHadir = unitDipilih ? unitDipilih.ahli.filter((m) => kehadiran[m.idMurid]).length : 0
  const jumlahAhli = unitDipilih ? unitDipilih.ahli.length : 0

  return (
    <div>
      <div className="p-4 rounded-card border border-border bg-surface mb-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="tahunKehadiran" className="block text-xs font-medium text-ink mb-1">Tahun</label>
            <select
              id="tahunKehadiran"
              value={tahunSesi}
              onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDipilih(null) }}
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
              onChange={(e) => { setPerjumpaan(Number(e.target.value)); setUnitDipilih(null) }}
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            >
              {PERJUMPAAN_SENARAI.map((p) => (
                <option key={p} value={p}>Perjumpaan {p}</option>
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
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {unitDitapis.map((u) => {
            const rekod = kehadiranSenarai.find((r) => r.unitId === u.id && r.perjumpaan === perjumpaan)
            const aktif = unitDipilih?.id === u.id
            return (
              <button
                key={u.id}
                onClick={() => pilihUnit(u)}
                className="flex items-center gap-3 text-left p-3 rounded-card bg-surface transition-all"
                style={{
                  border: `${aktif ? 2 : 1}px solid ${aktif ? '#C8102E' : rekod ? '#378ADD' : '#E5E5E5'}`,
                  boxShadow: aktif ? '0 2px 10px rgba(200,16,46,0.12)' : rekod ? '0 2px 10px rgba(55,138,221,0.10)' : 'none',
                }}
              >
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: rekod ? '#E6F1FB' : '#F1EFE8' }}
                >
                  {u.gambarUnit ? (
                    <img src={u.gambarUnit} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users size={18} style={{ color: rekod ? '#0C447C' : '#888780' }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{u.namaUnit}</p>
                  <p className="text-xs text-inkmuted truncate">{labelKategori(u.kategoriUnit)} · {(u.ahli ?? []).length} ahli</p>
                </div>
                {rekod && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: '#378ADD', color: '#fff' }}>
                    Diisi
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {unitDipilih && (
        <div className="rounded-card border border-border bg-surface overflow-hidden">
          <div className="p-4" style={{ backgroundColor: '#1A1A1A' }}>
            <p className="text-sm font-bold text-white">{unitDipilih.namaUnit}</p>
            <p className="text-xs text-white/70">Perjumpaan {perjumpaan} · {tarikh}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 border-b border-border">
            <div className="text-center p-2 rounded-card" style={{ backgroundColor: '#F1EFE8' }}>
              <p className="text-lg font-bold text-ink">{jumlahAhli}</p>
              <p className="text-[10px] text-inkmuted">Jumlah Ahli</p>
            </div>
            <div className="text-center p-2 rounded-card" style={{ backgroundColor: '#EAF3DE' }}>
              <p className="text-lg font-bold" style={{ color: '#27500A' }}>{jumlahHadir}</p>
              <p className="text-[10px]" style={{ color: '#27500A' }}>Hadir</p>
            </div>
            <div className="text-center p-2 rounded-card" style={{ backgroundColor: '#FBEAF0' }}>
              <p className="text-lg font-bold" style={{ color: '#72243E' }}>{jumlahAhli - jumlahHadir}</p>
              <p className="text-[10px]" style={{ color: '#72243E' }}>Tak Hadir</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {Object.entries(ahliIkutTahun)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([tahun, senaraiAhli]) => (
                <div key={tahun}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}>
                      {tahun}
                    </span>
                    <span className="text-xs text-inkmuted">{senaraiAhli.length} ahli</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {senaraiAhli.map((m) => {
                      const hadir = kehadiran[m.idMurid] ?? true
                      return (
                        <button
                          key={m.idMurid}
                          onClick={() => toggl(m)}
                          className="flex items-center gap-1.5 p-2.5 rounded-card text-left text-xs font-medium transition-all border"
                          style={{
                            backgroundColor: hadir ? '#EAF3DE' : '#F8F8F6',
                            color: hadir ? '#27500A' : '#888780',
                            borderColor: hadir ? '#C8DDB0' : '#E5E5E5',
                          }}
                        >
                          {hadir ? <Check size={14} className="shrink-0" /> : <XCircle size={14} className="shrink-0" />}
                          <span className="truncate flex-1">{m.nama}</span>
                          {m.adalahLF && <Star size={12} className="shrink-0 fill-current" style={{ color: '#F2C230' }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>

          <div className="p-4 pt-0">
            {selesai && (
              <p className="flex items-center gap-1.5 text-xs font-medium mb-3" style={{ color: '#27500A' }}>
                <CheckCircle2 size={14} /> Rekod kehadiran berjaya disimpan.
              </p>
            )}
            <button
              onClick={hantar}
              disabled={menyimpan}
              className="w-full h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
            >
              {menyimpan ? 'Menyimpan…' : 'Submit Kehadiran'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
