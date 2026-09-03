import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Printer, X } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useCetak } from '../../hooks/useCetak.js'
import { muatkanOppm, tambahOppm, kemaskiniOppm, padamOppm } from '../../hooks/useOppm.js'
import { BULAN_SENARAI, janaJulatBulan, STATUS_BULANAN, TAHAP_TANGGUNGJAWAB, LABEL_TAHAP } from './oppmConstants.js'
import CetakOPPM from './CetakOPPM.jsx'

const TUGASAN_KOSONG = { nama: '', objektifBerkaitan: [false, false, false, false, false], tanggungjawab: [], statusBulan: {} }

const MEDAN_KOSONG = {
  namaProjek: '', ketua: '', objektifProjek: '', tahunSesi: '',
  bulanMula: 'Januari', bulanAkhir: 'Disember',
  objektif: ['', '', '', '', ''],
  tugasan: [],
  petunjukPencapaian: [],
  belanjawan: [],
}

function Medan({ label, value, onChange, placeholder, textarea, type = 'text' }) {
  const Komponen = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      <Komponen
        type={textarea ? undefined : type}
        rows={textarea ? 2 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 rounded-card border border-border bg-surface text-sm ${textarea ? 'py-2 resize-y' : 'h-10'}`}
      />
    </div>
  )
}

function KadTugasan({ tugasan, indeks, objektifSenarai, senaraiBulan, senaraiNamaStaff, onUbah, onBuang }) {
  function u(medan, nilai) {
    onUbah(indeks, { ...tugasan, [medan]: nilai })
  }

  function toggleObjektif(i) {
    const baru = [...tugasan.objektifBerkaitan]
    baru[i] = !baru[i]
    u('objektifBerkaitan', baru)
  }

  function tambahTanggungjawab() {
    u('tanggungjawab', [...tugasan.tanggungjawab, { nama: '', tahap: 'A' }])
  }

  function ubahTanggungjawab(i, medan, nilai) {
    const baru = tugasan.tanggungjawab.map((t, idx) => (idx === i ? { ...t, [medan]: nilai } : t))
    u('tanggungjawab', baru)
  }

  function buangTanggungjawab(i) {
    u('tanggungjawab', tugasan.tanggungjawab.filter((_, idx) => idx !== i))
  }

  function ubahStatusBulan(bulan, status) {
    u('statusBulan', { ...tugasan.statusBulan, [bulan]: status })
  }

  return (
    <div className="p-3.5 rounded-card border border-border bg-surface space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-bold text-inkmuted mt-2.5 shrink-0">{indeks + 1}.</span>
        <input
          type="text"
          value={tugasan.nama}
          onChange={(e) => u('nama', e.target.value)}
          placeholder="Nama tugasan/aktiviti…"
          className="flex-1 h-10 px-3 rounded-card border border-border bg-base text-sm"
        />
        <button onClick={() => onBuang(indeks)} aria-label="Buang tugasan" className="p-2 rounded-card hover:bg-base text-brand-red shrink-0">
          <Trash2 size={15} />
        </button>
      </div>

      <div>
        <p className="text-[11px] font-medium text-inkmuted mb-1.5">Objektif berkaitan</p>
        <div className="flex flex-wrap gap-1.5">
          {objektifSenarai.map((teks, i) => (
            <label key={i} className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full border cursor-pointer ${tugasan.objektifBerkaitan[i] ? 'bg-brand-red text-white border-brand-red' : 'border-border text-inkmuted'}`}>
              <input type="checkbox" checked={tugasan.objektifBerkaitan[i]} onChange={() => toggleObjektif(i)} className="hidden" />
              Objektif {i + 1}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium text-inkmuted mb-1.5">Tanggungjawab</p>
        <div className="space-y-1.5">
          {tugasan.tanggungjawab.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                list="senarai-nama-staff-oppm"
                value={t.nama}
                onChange={(e) => ubahTanggungjawab(i, 'nama', e.target.value)}
                placeholder="Nama…"
                className="flex-1 h-9 px-2.5 rounded-card border border-border bg-base text-xs"
              />
              <select value={t.tahap} onChange={(e) => ubahTanggungjawab(i, 'tahap', e.target.value)} className="h-9 px-2 rounded-card border border-border bg-base text-xs shrink-0">
                {TAHAP_TANGGUNGJAWAB.map((tp) => (
                  <option key={tp} value={tp}>{tp} - {LABEL_TAHAP[tp]}</option>
                ))}
              </select>
              <button onClick={() => buangTanggungjawab(i)} aria-label="Buang" className="p-1.5 rounded-card hover:bg-base text-brand-red shrink-0"><X size={13} /></button>
            </div>
          ))}
          <button onClick={tambahTanggungjawab} className="flex items-center gap-1 text-[11px] font-semibold text-ink">
            <Plus size={12} /> Tambah orang
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium text-inkmuted mb-1.5">Status ikut bulan</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {senaraiBulan.map((bulan) => (
            <div key={bulan} className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-card bg-base">
              <span className="text-[10px] text-inkmuted truncate">{bulan}</span>
              <select
                value={tugasan.statusBulan[bulan] || 'belum'}
                onChange={(e) => ubahStatusBulan(bulan, e.target.value)}
                className="h-7 px-1 rounded border border-border bg-surface text-[10px] shrink-0"
              >
                {STATUS_BULANAN.map((s) => (
                  <option key={s.nilai} value={s.nilai}>{s.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <datalist id="senarai-nama-staff-oppm">
        {senaraiNamaStaff.map((n) => <option key={n} value={n} />)}
      </datalist>
    </div>
  )
}

export default function OPPMDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { profiles } = useProfilesList()
  const [dataCetak, setDataCetak] = useCetak((d) => `OPPM-${(d.namaProjek || 'Projek').toUpperCase().replace(/\s+/g, '_')}`)

  const adaId = id && id !== 'baharu'
  const [data, setData] = useState(MEDAN_KOSONG)
  const [memuatkan, setMemuatkan] = useState(adaId)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  useEffect(() => {
    if (!adaId) return
    let batal = false
    ;(async () => {
      const rekod = await muatkanOppm(id)
      if (batal) return
      if (rekod) setData({ ...MEDAN_KOSONG, ...rekod })
      setMemuatkan(false)
    })()
    return () => { batal = true }
  }, [id, adaId])

  const senaraiBulan = janaJulatBulan(data.bulanMula, data.bulanAkhir)
  const senaraiNamaStaff = profiles.map((p) => p.nama)

  function u(medan, nilai) {
    setData((d) => ({ ...d, [medan]: nilai }))
  }

  function ubahObjektif(i, teks) {
    const baru = [...data.objektif]
    baru[i] = teks
    u('objektif', baru)
  }

  function tambahTugasan() {
    u('tugasan', [...data.tugasan, { ...TUGASAN_KOSONG, objektifBerkaitan: [false, false, false, false, false], tanggungjawab: [] }])
  }

  function ubahTugasan(i, tugasanBaru) {
    u('tugasan', data.tugasan.map((t, idx) => (idx === i ? tugasanBaru : t)))
  }

  function buangTugasan(i) {
    u('tugasan', data.tugasan.filter((_, idx) => idx !== i))
  }

  function tambahPetunjuk() {
    u('petunjukPencapaian', [...data.petunjukPencapaian, ''])
  }

  function ubahPetunjuk(i, teks) {
    u('petunjukPencapaian', data.petunjukPencapaian.map((p, idx) => (idx === i ? teks : p)))
  }

  function buangPetunjuk(i) {
    u('petunjukPencapaian', data.petunjukPencapaian.filter((_, idx) => idx !== i))
  }

  function tambahBelanjawan() {
    u('belanjawan', [...data.belanjawan, { sumber: '', anggaran: '', belanja: '' }])
  }

  function ubahBelanjawan(i, medan, nilai) {
    u('belanjawan', data.belanjawan.map((b, idx) => (idx === i ? { ...b, [medan]: nilai } : b)))
  }

  function buangBelanjawan(i) {
    u('belanjawan', data.belanjawan.filter((_, idx) => idx !== i))
  }

  async function simpan() {
    setRalat(null)
    if (!data.namaProjek.trim()) {
      setRalat('Sila isi Nama Projek/Jawatankuasa.')
      return
    }
    setMenyimpan(true)
    try {
      if (adaId) {
        await kemaskiniOppm(id, data, user.uid)
      } else {
        const idBaru = await tambahOppm(data, user.uid)
        navigate(`/kurikulum/oppm/${idBaru}`, { replace: true })
      }
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam() {
    if (!(await konfirm('Padam OPPM ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamOppm(id)
    navigate('/kurikulum/oppm')
  }

  function cetak() {
    setDataCetak(data)
  }

  if (memuatkan) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div className="max-w-2xl">
      <Link to="/kurikulum/oppm" className="inline-flex items-center gap-1.5 text-xs text-inkmuted hover:text-ink mb-4">
        <ArrowLeft size={14} /> OPPM
      </Link>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">1. Maklumat Am</p>
          <div className="space-y-3">
            <Medan label="Nama Projek / Jawatankuasa" value={data.namaProjek} onChange={(v) => u('namaProjek', v)} placeholder="cth. Panitia Matematik / Projek Mega Smart TV" />
            <div className="grid grid-cols-2 gap-3">
              <Medan label="Ketua" value={data.ketua} onChange={(v) => u('ketua', v)} />
              <Medan label="Tahun Sesi" value={data.tahunSesi} onChange={(v) => u('tahunSesi', v)} placeholder="2025/2026" />
            </div>
            <Medan label="Objektif Projek (ringkasan)" value={data.objektifProjek} onChange={(v) => u('objektifProjek', v)} textarea />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Bulan Mula</label>
                <select value={data.bulanMula} onChange={(e) => u('bulanMula', e.target.value)} className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm">
                  {BULAN_SENARAI.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Bulan Akhir</label>
                <select value={data.bulanAkhir} onChange={(e) => u('bulanAkhir', e.target.value)} className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm">
                  {BULAN_SENARAI.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-inkmuted">Tempoh: {senaraiBulan.join(' → ')}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">2. Objektif (sehingga 5)</p>
          <div className="space-y-2">
            {data.objektif.map((teks, i) => (
              <Medan key={i} label={`Objektif ${i + 1}`} value={teks} onChange={(v) => ubahObjektif(i, v)} placeholder="Pilihan - boleh kosongkan" />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-inkmuted uppercase tracking-wide">3. Tugasan / Aktiviti</p>
            <button onClick={tambahTugasan} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah
            </button>
          </div>
          {data.tugasan.length === 0 ? (
            <p className="text-xs text-inkmuted">Belum ada tugasan.</p>
          ) : (
            <div className="space-y-3">
              {data.tugasan.map((t, i) => (
                <KadTugasan
                  key={i}
                  tugasan={t}
                  indeks={i}
                  objektifSenarai={data.objektif}
                  senaraiBulan={senaraiBulan}
                  senaraiNamaStaff={senaraiNamaStaff}
                  onUbah={ubahTugasan}
                  onBuang={buangTugasan}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-inkmuted uppercase tracking-wide">4. Petunjuk Pencapaian (KPI)</p>
            <button onClick={tambahPetunjuk} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah
            </button>
          </div>
          <div className="space-y-1.5">
            {data.petunjukPencapaian.map((teks, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input type="text" value={teks} onChange={(e) => ubahPetunjuk(i, e.target.value)} placeholder="cth. Bil murid TP5/6 meningkat" className="flex-1 h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                <button onClick={() => buangPetunjuk(i)} aria-label="Buang" className="p-1.5 rounded-card hover:bg-base text-brand-red shrink-0"><X size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-inkmuted uppercase tracking-wide">5. Belanjawan</p>
            <button onClick={tambahBelanjawan} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah
            </button>
          </div>
          <div className="space-y-1.5">
            {data.belanjawan.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input type="text" value={b.sumber} onChange={(e) => ubahBelanjawan(i, 'sumber', e.target.value)} placeholder="Sumber (cth. PIBG)" className="flex-1 h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                <input type="number" value={b.anggaran} onChange={(e) => ubahBelanjawan(i, 'anggaran', e.target.value)} placeholder="Anggaran" className="w-24 h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                <input type="number" value={b.belanja} onChange={(e) => ubahBelanjawan(i, 'belanja', e.target.value)} placeholder="Belanja" className="w-24 h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                <button onClick={() => buangBelanjawan(i)} aria-label="Buang" className="p-1.5 rounded-card hover:bg-base text-brand-red shrink-0"><X size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

        <div className="flex gap-3 pt-2 border-t border-border sticky bottom-0 bg-surface pb-2">
          <button onClick={simpan} disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : adaId ? 'Kemaskini' : 'Simpan'}
          </button>
          <button onClick={cetak} className="h-12 px-4 rounded-card border border-border text-sm font-medium text-ink flex items-center gap-1.5">
            <Printer size={15} /> Cetak
          </button>
          {adaId && (
            <button onClick={padam} title="Padam" aria-label="Padam" className="h-12 w-12 shrink-0 rounded-card border border-brand-red/30 text-brand-red flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {dataCetak && <CetakOPPM data={dataCetak} />}
    </div>
  )
}
