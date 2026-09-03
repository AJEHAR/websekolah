import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom'
import { ArrowLeft, Users, CalendarDays, Award, ClipboardCheck, FileText, Printer, ExternalLink } from 'lucide-react'
import { useUnitUBKSSatu } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { muatkanPerancangan } from '../../hooks/usePerancanganUBKS.js'
import { ambilKehadiranUnit } from '../../hooks/useKehadiranUBKS.js'
import { senaraiLaporanUnit } from '../../hooks/useLaporanUBKS.js'
import { useCetak } from '../../hooks/useCetak.js'
import { senaraiGuru, namaFailLaporanUBKS } from './unitHelpers.js'
import CetakLaporanUBKS from './CetakLaporanUBKS.jsx'

const SEMUA_PERJUMPAAN = Array.from({ length: 12 }, (_, i) => i + 1)

function Seksyen({ ikon: Ikon, tajuk, anak }) {
  return (
    <div className="border border-border rounded-card bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-base">
        <Ikon size={16} className="text-inkmuted" />
        <h3 className="text-sm font-bold text-ink">{tajuk}</h3>
      </div>
      <div className="p-4">{anak}</div>
    </div>
  )
}

// "Fail Unit" - satu page konsolidasi SEMUA rekod unit (Perancangan,
// Jawatankuasa, Ahli, Kehadiran, Laporan) - reka bentuk khusus untuk
// senang tunjuk terus kepada Nazir KPM/pemeriksa luar semasa lawatan,
// tanpa perlu navigate merata page. TAK cipta data baru - kumpul &
// pautkan terus dari sumber sedia ada (satu pintu masuk sahaja).
export default function FailUnit() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { unit, loading: loadingUnit } = useUnitUBKSSatu(unitId)
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const [dataCetak, setDataCetak] = useCetak((d) => namaFailLaporanUBKS({ unit: d.unit }))

  const [perancangan, setPerancangan] = useState(null)
  const [kehadiranSemua, setKehadiranSemua] = useState([])
  const [statusLaporan, setStatusLaporan] = useState({})
  const [memuatkan, setMemuatkan] = useState(true)

  useEffect(() => {
    if (!unit) return
    let batal = false
    setMemuatkan(true)
    ;(async () => {
      const [p, k, l] = await Promise.all([
        muatkanPerancangan(unit.id),
        ambilKehadiranUnit(unit.id),
        senaraiLaporanUnit(unit.tahunSesi, unit.id),
      ])
      if (batal) return
      setPerancangan(p)
      setKehadiranSemua(k.filter((r) => String(r.tahunSesi) === String(unit.tahunSesi)))
      const peta = {}
      l.forEach((r) => { peta[r.perjumpaan] = r })
      setStatusLaporan(peta)
      setMemuatkan(false)
    })()
    return () => { batal = true }
  }, [unit])

  function cetakLaporan(perjumpaan) {
    const rekod = statusLaporan[perjumpaan]
    if (!rekod) return
    setDataCetak({ data: rekod, unit, perjumpaan })
  }

  if (loadingUnit || memuatkan) return <p className="text-sm text-inkmuted">Memuatkan…</p>
  if (!unit) {
    return (
      <div>
        <p className="text-sm text-inkmuted mb-3">Unit tidak dijumpai.</p>
        <Link to="/eubks/murid-ubks" className="text-sm text-brand-red font-medium">← Kembali ke Murid UBKS</Link>
      </div>
    )
  }

  const namaKategori = kategoriSenarai.find((k) => k.kod === unit.kategoriUnit)?.nama ?? unit.kategoriUnit
  const guru = senaraiGuru(unit)
  const jawatankuasa = (unit.ahli ?? []).filter((a) => a.jawatan?.trim())
  const semuaAhli = unit.ahli ?? []
  const slotPerancangan = perancangan?.senaraiPerjumpaan ?? []
  const bilPerancanganDiisi = slotPerancangan.filter((p) => p.perancangan?.trim()).length
  const bilKehadiranDiisi = kehadiranSemua.length
  const bilLaporanDiisi = Object.keys(statusLaporan).length

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-inkmuted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Kembali
      </button>

      {/* Kepala - ringkasan status keseluruhan, sekali pandang */}
      <div className="rounded-card border border-border bg-surface p-5 mb-4">
        <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide">Fail Unit</p>
        <h1 className="text-lg font-bold text-ink mb-1">{unit.namaUnit}</h1>
        <p className="text-xs text-inkmuted mb-4">{namaKategori} · Tahun Sesi {unit.tahunSesi} · Guru Penasihat: {guru.map((g) => g.nama).join(', ') || '-'}</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-card bg-base">
            <p className="text-lg font-bold text-ink leading-none">{semuaAhli.length}</p>
            <p className="text-[10px] text-inkmuted mt-1">Ahli</p>
          </div>
          <div className="text-center p-2 rounded-card bg-base">
            <p className="text-lg font-bold text-ink leading-none">{bilPerancanganDiisi}/12</p>
            <p className="text-[10px] text-inkmuted mt-1">Perancangan</p>
          </div>
          <div className="text-center p-2 rounded-card bg-base">
            <p className="text-lg font-bold text-ink leading-none">{bilKehadiranDiisi}/12</p>
            <p className="text-[10px] text-inkmuted mt-1">Kehadiran</p>
          </div>
          <div className="text-center p-2 rounded-card bg-base">
            <p className="text-lg font-bold text-ink leading-none">{bilLaporanDiisi}/12</p>
            <p className="text-[10px] text-inkmuted mt-1">Laporan</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Seksyen ikon={CalendarDays} tajuk="Perancangan Unit" anak={
          slotPerancangan.length === 0 ? (
            <p className="text-xs text-inkmuted">Belum diisi.</p>
          ) : (
            <div className="space-y-1.5">
              {slotPerancangan.map((p) => (
                <div key={p.perjumpaan} className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-ink shrink-0 w-16">Bil. {p.perjumpaan}</span>
                  <span className="text-inkmuted shrink-0 w-20">{p.tarikhSelesai || '-'}</span>
                  <span className="text-ink flex-1">{p.perancangan || <span className="text-inkmuted">Belum diisi</span>}</span>
                  {p.selesai && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] shrink-0">Selesai</span>}
                </div>
              ))}
            </div>
          )
        } />

        <Seksyen ikon={Award} tajuk={`Jawatankuasa (${jawatankuasa.length})`} anak={
          jawatankuasa.length === 0 ? (
            <p className="text-xs text-inkmuted">Belum ada jawatankuasa dilantik.</p>
          ) : (
            <div className="space-y-1">
              {jawatankuasa.map((a) => (
                <div key={a.idMurid} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-b-0">
                  <span className="text-ink">{a.nama}</span>
                  <span className="text-brand-red font-semibold">{a.jawatan}</span>
                </div>
              ))}
            </div>
          )
        } />

        <Seksyen ikon={Users} tajuk={`Senarai Ahli (${semuaAhli.length})`} anak={
          semuaAhli.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada ahli lagi.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {semuaAhli.map((a) => (
                <p key={a.idMurid} className="text-xs text-ink truncate">{a.nama}</p>
              ))}
            </div>
          )
        } />

        <Seksyen ikon={ClipboardCheck} tajuk="Kehadiran" anak={
          kehadiranSemua.length === 0 ? (
            <p className="text-xs text-inkmuted">Belum ada rekod kehadiran.</p>
          ) : (
            <div className="space-y-1">
              {kehadiranSemua
                .sort((a, b) => a.perjumpaan - b.perjumpaan)
                .map((k) => (
                  <div key={k.id} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-b-0">
                    <span className="text-ink">Bil. {k.perjumpaan} — {k.tarikh || '-'}</span>
                    <span className="font-semibold text-ink">{k.jumlahHadir}/{k.jumlahAhli} hadir</span>
                  </div>
                ))}
            </div>
          )
        } />

        <Seksyen ikon={FileText} tajuk="Laporan Aktiviti Perjumpaan" anak={
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SEMUA_PERJUMPAAN.map((p) => {
              const ada = Boolean(statusLaporan[p])
              return (
                <div key={p} className="flex flex-col gap-1">
                  <button
                    onClick={() => navigate(`/eubks/laporan-ubks/${unit.id}/${p}`)}
                    className="h-12 rounded-card border flex flex-col items-center justify-center gap-0.5"
                    style={ada ? { borderColor: '#0F6E56', backgroundColor: '#E1F5EE', color: '#0F6E56' } : { borderColor: '#E5E5E5', color: '#5C5C5C' }}
                  >
                    <span className="text-[11px] font-semibold">Bil. {p}</span>
                  </button>
                  {ada && (
                    <button onClick={() => cetakLaporan(p)} className="flex items-center justify-center gap-1 h-6 rounded-card border border-border text-[9px] text-inkmuted">
                      <Printer size={10} /> Cetak
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        } />
      </div>

      <Link to={`/eubks/murid-ubks/${unit.id}`} className="inline-flex items-center gap-1.5 text-xs text-brand-red font-medium mt-4">
        Buka halaman Unit penuh (edit) <ExternalLink size={12} />
      </Link>

      {dataCetak && <CetakLaporanUBKS data={dataCetak.data} unit={dataCetak.unit} perjumpaan={dataCetak.perjumpaan} />}
    </div>
  )
}
