import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom'
import { ArrowLeft, Plus, PenLine, Move, Printer, X, RotateCcw, Sparkles } from 'lucide-react'
import { todayISO, namaHari } from '../../lib/dateUtils.js'
import { muatNaikKeDrive, janaAiLaporanUBKS } from '../../lib/driveUpload.js'
import { usePikebm } from '../../hooks/usePikebm.js'
import { useSivikKokurikulum } from '../../hooks/useSivikKokurikulum.js'
import { useUnitUBKSSatu, kemaskiniUnit } from '../../hooks/useUnitUBKS.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useDialog } from '../../context/DialogContext.jsx'
import { muatkanLaporanUBKS, simpanLaporanUBKS } from '../../hooks/useLaporanUBKS.js'
import { muatkanPerancangan } from '../../hooks/usePerancanganUBKS.js'
import { muatkanKehadiranSatu } from '../../hooks/useKehadiranUBKS.js'
import { senaraiGuru, cariTtdTersimpan, upsertTtdTersimpan } from './unitHelpers.js'
import PemotongGambarModal from '../Kurikulum/PemotongGambarModal.jsx'
import TandatanganModal from '../Kurikulum/TandatanganModal.jsx'
import CetakLaporanUBKS from './CetakLaporanUBKS.jsx'

const SIVIK_KOSONG = { nilai: '', tajuk: '', aktiviti: '' }

// Format ringkas DD/MM/YYYY untuk paparan/cetakan (bukan
// formatTarikhPaparan yang sertakan nama hari sekali - dah ada medan
// "Hari" berasingan, elak bertindih/berulang).
function ddmmyyyy(iso) {
  if (!iso) return ''
  const [t, b, h] = iso.split('-')
  return `${h}/${b}/${t}`
}

const MEDAN_KOSONG = {
  tarikh: '', masa: '', tempat: '', bilAhliHadir: '', guruPenasihat: '',
  laporanAktiviti: '', refleksi: '',
  pikebmTajuk: '', pikebmObjektif: '',
  sivik: [{ ...SIVIK_KOSONG }, { ...SIVIK_KOSONG }],
  gambar: [null, null, null, null],
  namaSetiausaha: '', ttdSetiausahaUrl: '',
  namaGuruTtd: '', ttdGuruUrl: '',
  namaGPK: '', ttdGPKUrl: '',
}

function Medan({ label, value, onChange, textarea, placeholder, type = 'text', readOnly }) {
  const Komponen = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      <Komponen
        type={textarea ? undefined : type}
        rows={textarea ? 3 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 rounded-card border border-border text-sm ${textarea ? 'py-2 resize-y' : 'h-10'} ${readOnly ? 'bg-base text-inkmuted' : 'bg-surface'}`}
      />
    </div>
  )
}

function BlokTtd({ label, nama, ttdUrl, onNama, onTandatangan, onPadamTtd }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink mb-1.5">{label}</p>
      {ttdUrl ? (
        <div className="relative h-16 rounded-card border border-border bg-white flex items-center justify-center mb-1.5">
          <img src={ttdUrl} alt="Tandatangan" className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={onPadamTtd} className="absolute top-1 right-1 text-[10px] text-brand-red font-semibold">Padam</button>
        </div>
      ) : (
        <button type="button" onClick={onTandatangan} className="w-full h-10 rounded-card border border-dashed border-border text-xs font-semibold text-inkmuted flex items-center justify-center gap-1.5 mb-1.5">
          <PenLine size={13} /> Tandatangan
        </button>
      )}
      <input type="text" value={nama} onChange={(e) => onNama(e.target.value)} placeholder="Nama" className="w-full h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
    </div>
  )
}

function BlokTtdBank({ label, senaraiNama, nama, ttdUrl, adaTersimpan, onPilihNama, onTandatangan, onGunaTersimpan, onPadamTtd }) {
  const [modLain, setModLain] = useState(false)
  return (
    <div>
      <p className="text-xs font-medium text-ink mb-1.5">{label}</p>
      {ttdUrl ? (
        <div className="relative h-16 rounded-card border border-border bg-white flex items-center justify-center mb-1.5">
          <img src={ttdUrl} alt="Tandatangan" className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={onPadamTtd} className="absolute top-1 right-1 text-[10px] text-brand-red font-semibold">Padam</button>
        </div>
      ) : (
        <div className="flex gap-1.5 mb-1.5">
          <button type="button" onClick={onTandatangan} className="flex-1 h-10 rounded-card border border-dashed border-border text-xs font-semibold text-inkmuted flex items-center justify-center gap-1.5">
            <PenLine size={13} /> Tandatangan
          </button>
          {adaTersimpan && (
            <button type="button" onClick={onGunaTersimpan} title="Guna tandatangan tersimpan" className="h-10 w-10 rounded-card border border-border text-inkmuted flex items-center justify-center shrink-0">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}
      {modLain || (nama && !senaraiNama.includes(nama)) ? (
        <input
          autoFocus={modLain}
          type="text"
          value={nama}
          onChange={(e) => onPilihNama(e.target.value)}
          placeholder="Taip nama…"
          className="w-full h-9 px-2.5 rounded-card border border-border bg-surface text-xs"
        />
      ) : (
        <select value={nama} onChange={(e) => (e.target.value === '__lain' ? setModLain(true) : onPilihNama(e.target.value))} className="w-full h-9 px-2 rounded-card border border-border bg-surface text-xs">
          <option value="">-- Pilih nama --</option>
          {senaraiNama.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
          <option value="__lain">Lain-lain (taip nama)…</option>
        </select>
      )}
    </div>
  )
}

// Halaman PENUH (bukan popup) untuk SATU Laporan Aktiviti Perjumpaan -
// subpage /eubks/laporan-ubks/:unitId/:perjumpaan.
export default function LaporanUBKSDetail() {
  const { unitId, perjumpaan: perjumpaanStr } = useParams()
  const perjumpaan = Number(perjumpaanStr)
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { unit, loading: loadingUnit } = useUnitUBKSSatu(unitId)
  const { senarai: senaraiPikebm } = usePikebm()
  const { senarai: senaraiSivik } = useSivikKokurikulum()
  const [dataCetak, setDataCetak] = useCetak()
  const { konfirm, amaran } = useDialog()

  const [data, setData] = useState(MEDAN_KOSONG)
  const [memuatkan, setMemuatkan] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)
  const [mencetak, setMencetak] = useState(false)
  const [ralat, setRalat] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [rekodSediaAda, setRekodSediaAda] = useState(false)

  const [slotCrop, setSlotCrop] = useState(null)
  const [gambarMentah, setGambarMentah] = useState(null)
  const [memuatNaikSlot, setMemuatNaikSlot] = useState(null)
  const [tunjukTtd, setTunjukTtd] = useState(null)

  // --- Perancangan Unit (SEMENTARA - bantu AI sahaja, TAK disimpan dalam rekod Laporan) ---
  const [senaraiPerancanganUnit, setSenaraiPerancanganUnit] = useState([])
  const [perancanganDicek, setPerancanganDicek] = useState(new Set())
  const [lainLain, setLainLain] = useState('')
  const [menjanaAI, setMenjanaAI] = useState(false)

  useEffect(() => {
    if (!unit) return
    let batal = false
    setMemuatkan(true)
    ;(async () => {
      const [sediaAda, perancangan, kehadiran] = await Promise.all([
        muatkanLaporanUBKS(unit.tahunSesi, unit.id, perjumpaan),
        muatkanPerancangan(unit.id),
        muatkanKehadiranSatu(unit.tahunSesi, unit.id, perjumpaan),
      ])
      if (batal) return

      const semuaPerjumpaan = perancangan?.senaraiPerjumpaan ?? []
      setSenaraiPerancanganUnit(semuaPerjumpaan)
      const slotSemasa = semuaPerjumpaan.find((p) => p.perjumpaan === perjumpaan)
      // Pra-tick perancangan perjumpaan SEMASA sahaja (kalau ada kandungan) -
      // staff boleh tambah/buang tick lain sebelum jana AI.
      setPerancanganDicek(slotSemasa?.perancangan?.trim() ? new Set([perjumpaan]) : new Set())

      if (sediaAda) {
        setRekodSediaAda(true)
        // Sokong rekod LAMA (nilaiTeras/nilaiAktiviti tunggal) -> migrate ke
        // struktur sivik[] (2 slot) secara telus, staff tak perasan pun.
        const sivikSediaAda = sediaAda.sivik?.length
          ? sediaAda.sivik
          : sediaAda.nilaiTeras || sediaAda.nilaiAktiviti
            ? [{ nilai: sediaAda.nilaiTeras || '', tajuk: '', aktiviti: sediaAda.nilaiAktiviti || '' }, { ...SIVIK_KOSONG }]
            : [{ ...SIVIK_KOSONG }, { ...SIVIK_KOSONG }]
        setData({ ...MEDAN_KOSONG, ...sediaAda, sivik: sivikSediaAda })
      } else {
        setRekodSediaAda(false)
        const setiausaha = unit.ahli?.find((a) => a.jawatan?.toLowerCase().includes('setiausaha'))
        const senaraiGpArr = senaraiGuru(unit)
        const gpTeks = senaraiGpArr.map((g) => (g.tahunDarjah ? `${g.nama} (${g.tahunDarjah})` : g.nama)).join(', ')
        const namaGuruLalai = senaraiGpArr[0]?.nama || ''
        const namaSetiausahaLalai = setiausaha?.nama || ''
        setData({
          ...MEDAN_KOSONG,
          // Tarikh lalai TAHUN SEMASA (bukan cuba "auto dari Perancangan" -
          // Perancangan UBKS tak ada medan tarikh dirancang boleh diisi pun,
          // jadi sentiasa kosong - lebih berguna default hari ni terus,
          // staff tukar manual kalau buat hari lain).
          tarikh: todayISO(),
          guruPenasihat: gpTeks,
          namaGuruTtd: namaGuruLalai,
          ttdGuruUrl: cariTtdTersimpan(unit, namaGuruLalai) || '',
          namaSetiausaha: namaSetiausahaLalai,
          ttdSetiausahaUrl: cariTtdTersimpan(unit, namaSetiausahaLalai) || '',
          // Bil. Ahli Hadir - auto dari rekod KEHADIRAN SEBENAR (bukan reka
          // angka) - kalau kehadiran perjumpaan ni belum direkod, kosong.
          bilAhliHadir: kehadiran ? String(kehadiran.jumlahHadir ?? '') : '',
        })
      }
      setMemuatkan(false)
    })()
    return () => { batal = true }
  }, [unit, perjumpaan])

  function u(kunci, nilai) {
    setDirty(true)
    setData((d) => ({ ...d, [kunci]: nilai }))
  }

  useEffect(() => {
    function amaranKeluar(e) {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', amaranKeluar)
    return () => window.removeEventListener('beforeunload', amaranKeluar)
  }, [dirty])

  async function kembali() {
    if (dirty && !(await konfirm('Ada perubahan belum disimpan. Tinggalkan halaman ni tanpa simpan?', { bahaya: true }))) return
    navigate('/eubks/laporan-ubks')
  }

  function pilihPikebm(tajuk) {
    const item = senaraiPikebm.find((p) => p.tajuk === tajuk)
    u('pikebmTajuk', tajuk)
    u('pikebmObjektif', item?.objektif ?? data.pikebmObjektif)
  }

  function ubahSivik(i, medan, nilai) {
    setDirty(true)
    setData((d) => {
      const sivik = [...d.sivik]
      sivik[i] = { ...sivik[i], [medan]: nilai }
      return { ...d, sivik }
    })
  }

  function togglPerancangan(p) {
    setPerancanganDicek((s) => {
      const baru = new Set(s)
      if (baru.has(p)) baru.delete(p)
      else baru.add(p)
      return baru
    })
  }

  const perancanganBolehJana = senaraiPerancanganUnit.filter((p) => p.perancangan?.trim())
  const bolehJanaAI = perancanganDicek.size > 0 || lainLain.trim().length > 0

  async function janaAI() {
    // Amaran kalau dah ada kandungan (staff mungkin dah edit tangan lepas
    // jana AI kali pertama) - elak timpa kerja staff senyap-senyap.
    const adaKandunganSediaAda = data.laporanAktiviti.trim() || data.refleksi.trim() || data.sivik.some((s) => s.tajuk.trim() || s.aktiviti.trim())
    if (adaKandunganSediaAda) {
      const teruskan = await konfirm('Laporan Aktiviti/Refleksi/Nilai Sivik sedia ada akan DITIMPA hasil AI baru. Teruskan?', { bahaya: true })
      if (!teruskan) return
    }

    setMenjanaAI(true)
    setRalat(null)
    try {
      const teksPerancangan = [
        ...senaraiPerancanganUnit.filter((p) => perancanganDicek.has(p.perjumpaan)).map((p) => `Perjumpaan ${p.perjumpaan}: ${p.perancangan}`),
        lainLain.trim() ? `Lain-lain: ${lainLain.trim()}` : null,
      ].filter(Boolean).join('\n')

      const hasil = await janaAiLaporanUBKS({
        unit: unit.namaUnit,
        tarikh: ddmmyyyy(data.tarikh),
        hari: data.tarikh ? namaHari(data.tarikh) : '',
        masa: data.masa,
        tempat: data.tempat,
        bilAhliHadir: data.bilAhliHadir,
        pikebmTajuk: data.pikebmTajuk,
        pikebmObjektif: data.pikebmObjektif,
        perancangan: teksPerancangan,
        senaraiSivik: senaraiSivik.map((s) => ({ nilai: s.nilai, tajuk: s.tajuk, aktiviti: s.aktiviti })),
      })

      setDirty(true)
      setData((d) => ({
        ...d,
        laporanAktiviti: hasil.laporanAktiviti || d.laporanAktiviti,
        refleksi: hasil.refleksi || d.refleksi,
        sivik: hasil.sivik?.length ? [hasil.sivik[0] || { ...SIVIK_KOSONG }, hasil.sivik[1] || { ...SIVIK_KOSONG }] : d.sivik,
      }))
    } catch (err) {
      await amaran(err.message || 'Gagal jana dengan AI. Sila cuba lagi.')
    } finally {
      setMenjanaAI(false)
    }
  }

  function pilihGambarSlot(i, e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setGambarMentah(URL.createObjectURL(fail))
    setSlotCrop(i)
    e.target.value = ''
  }

  function larasGambarSlot(i) {
    setGambarMentah(data.gambar[i])
    setSlotCrop(i)
  }

  async function crophasilSah(blob) {
    const i = slotCrop
    setSlotCrop(null)
    setMemuatNaikSlot(i)
    try {
      const fail = new File([blob], `gambar-laporan-ubks-${i}.jpg`, { type: 'image/jpeg' })
      const hasil = await muatNaikKeDrive(fail, 'laporanUbks')
      setDirty(true)
      setData((d) => {
        const gambar = [...d.gambar]
        gambar[i] = hasil.url
        return { ...d, gambar }
      })
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik gambar.')
    } finally {
      setMemuatNaikSlot(null)
    }
  }

  function buangGambar(i) {
    setDirty(true)
    setData((d) => {
      const gambar = [...d.gambar]
      gambar[i] = null
      return { ...d, gambar }
    })
  }

  async function tandatanganSah(blob) {
    const kunci = tunjukTtd
    setTunjukTtd(null)
    try {
      const fail = new File([blob], `ttd-${kunci}.png`, { type: 'image/png' })
      const hasil = await muatNaikKeDrive(fail, 'laporanUbks', { mampatkan: false })
      const medan = { setiausaha: 'ttdSetiausahaUrl', guru: 'ttdGuruUrl', gpk: 'ttdGPKUrl' }[kunci]
      u(medan, hasil.url)

      if (kunci === 'setiausaha' || kunci === 'guru') {
        const namaMedan = kunci === 'setiausaha' ? 'namaSetiausaha' : 'namaGuruTtd'
        const namaSemasa = data[namaMedan]
        if (namaSemasa?.trim()) {
          await kemaskiniUnit(unit.id, { tandaTanganTersimpan: upsertTtdTersimpan(unit, namaSemasa.trim(), hasil.url) }, user.uid)
        }
      }
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik tandatangan.')
    }
  }

  function pilihNamaGuru(namaBaru) {
    u('namaGuruTtd', namaBaru)
    u('ttdGuruUrl', cariTtdTersimpan(unit, namaBaru) || '')
  }

  function pilihNamaSetiausaha(namaBaru) {
    u('namaSetiausaha', namaBaru)
    u('ttdSetiausahaUrl', cariTtdTersimpan(unit, namaBaru) || '')
  }

  async function simpan() {
    setRalat(null)
    setMenyimpan(true)
    try {
      await simpanLaporanUBKS(unit.tahunSesi, unit.id, unit.namaUnit, perjumpaan, data, user.uid)
      setDirty(false)
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function cetak() {
    setMencetak(true)
    try {
      if (dirty) await simpan()
      setDataCetak({ data, unit, perjumpaan })
    } finally {
      setMencetak(false)
    }
  }

  const namaGuruPilihan = unit ? senaraiGuru(unit).map((g) => g.nama) : []
  const namaSetiausahaPilihan = unit ? (unit.ahli ?? []).filter((a) => a.jawatan?.toLowerCase().includes('setiausaha')).map((a) => a.nama) : []

  if (loadingUnit || memuatkan) return <p className="text-sm text-inkmuted">Memuatkan…</p>
  if (!unit) {
    return (
      <div>
        <p className="text-sm text-inkmuted mb-3">Unit tidak dijumpai.</p>
        <Link to="/eubks/laporan-ubks" className="text-sm text-brand-red font-medium">← Kembali ke Laporan UBKS</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <button onClick={kembali} className="inline-flex items-center gap-1.5 text-xs text-inkmuted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Laporan UBKS
      </button>

      <div className="mb-5">
        <h2 className="text-base font-bold text-ink">Laporan Aktiviti Perjumpaan</h2>
        <p className="text-xs text-inkmuted">{unit.namaUnit} · Bil. Perjumpaan {perjumpaan}</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Medan label="Tarikh (boleh tukar manual)" value={data.tarikh} onChange={(v) => u('tarikh', v)} type="date" />
          <Medan label="Hari (auto dari Tarikh)" value={data.tarikh ? namaHari(data.tarikh) : ''} readOnly />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Medan label="Masa" value={data.masa} onChange={(v) => u('masa', v)} placeholder="4.00 petang" />
          <Medan label="Tempat" value={data.tempat} onChange={(v) => u('tempat', v)} />
        </div>
        <Medan
          label="Bil. Ahli Hadir (auto dari Kehadiran UBKS)"
          value={data.bilAhliHadir}
          onChange={(v) => u('bilAhliHadir', v)}
          placeholder="Belum ada rekod Kehadiran untuk perjumpaan ni"
        />
        <Medan label="Guru Penasihat (ringkasan untuk teks laporan)" value={data.guruPenasihat} onChange={(v) => u('guruPenasihat', v)} />

        <div className="p-3.5 rounded-card bg-base border border-border">
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-1">Perancangan Unit (bantu AI sahaja - tak disimpan)</p>
          <p className="text-[11px] text-inkmuted mb-3">Tick perancangan yang nak dijadikan asas AI tulis Laporan Aktiviti/Refleksi. Tak nak ikut Perancangan? Isi "Lain-lain" sahaja.</p>
          {perancanganBolehJana.length === 0 ? (
            <p className="text-xs text-inkmuted mb-3">Tiada Perancangan diisi lagi untuk unit ni.</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {perancanganBolehJana.map((p) => (
                <label key={p.perjumpaan} className="flex items-start gap-2 p-2 rounded-card bg-surface border border-border cursor-pointer">
                  <input type="checkbox" checked={perancanganDicek.has(p.perjumpaan)} onChange={() => togglPerancangan(p.perjumpaan)} className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-xs text-ink whitespace-pre-line"><strong>Perjumpaan {p.perjumpaan}:</strong> {p.perancangan}</span>
                </label>
              ))}
            </div>
          )}
          <label className="block text-xs font-medium text-ink mb-1">Lain-lain (taip sendiri, tak ikut Perancangan)</label>
          <textarea
            rows={2}
            value={lainLain}
            onChange={(e) => setLainLain(e.target.value)}
            placeholder="cth. Aktiviti sebenar berbeza dari perancangan sebab..."
            className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-y mb-3"
          />
          <button
            type="button"
            onClick={janaAI}
            disabled={!bolehJanaAI || menjanaAI}
            className="w-full h-11 rounded-card bg-ink text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Sparkles size={15} /> {menjanaAI ? 'Menjana dengan AI…' : 'Jana dengan AI'}
          </button>
        </div>

        <Medan label="Laporan Aktiviti" value={data.laporanAktiviti} onChange={(v) => u('laporanAktiviti', v)} textarea />
        <Medan label="Refleksi" value={data.refleksi} onChange={(v) => u('refleksi', v)} textarea />

        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Sisipan PIKeBM (10 minit)</p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tajuk</label>
              <select
                value={data.pikebmTajuk}
                onChange={(e) => pilihPikebm(e.target.value)}
                className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
              >
                <option value="">-- Pilih Aktiviti PIKeBM --</option>
                {senaraiPikebm.map((p) => (
                  <option key={p.id} value={p.tajuk}>{p.tajuk}</option>
                ))}
              </select>
            </div>
            <Medan label="Objektif (auto-isi, boleh edit)" value={data.pikebmObjektif} onChange={(v) => u('pikebmObjektif', v)} textarea />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-1">Penerapan Nilai Sivik Dalam Kokurikulum</p>
          <p className="text-[11px] text-inkmuted mb-2">2 tajuk (boleh isi manual, atau guna "Jana dengan AI" di atas untuk cadangan automatik).</p>
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="p-3 rounded-card border border-border space-y-2">
                <p className="text-[11px] font-semibold text-inkmuted">Nilai Sivik {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={data.sivik[i]?.nilai ?? ''} onChange={(e) => ubahSivik(i, 'nilai', e.target.value)} placeholder="Nilai (cth. Kasih Sayang)" className="h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                  <input type="text" value={data.sivik[i]?.tajuk ?? ''} onChange={(e) => ubahSivik(i, 'tajuk', e.target.value)} placeholder="Tajuk" className="h-9 px-2.5 rounded-card border border-border bg-surface text-xs" />
                </div>
                <textarea rows={2} value={data.sivik[i]?.aktiviti ?? ''} onChange={(e) => ubahSivik(i, 'aktiviti', e.target.value)} placeholder="Aktiviti…" className="w-full px-2.5 py-2 rounded-card border border-border bg-surface text-xs resize-y" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-1">Gambar Aktiviti</p>
          <p className="text-[11px] text-inkmuted mb-2">Tekan <Move size={10} className="inline" /> bila-bila untuk laras kedudukan gambar tanpa upload semula.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative aspect-square rounded-card border-2 border-dashed border-border bg-base overflow-hidden">
                {data.gambar[i] ? (
                  <>
                    <img src={data.gambar[i]} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => larasGambarSlot(i)} aria-label="Laraskan" className="absolute bottom-1 left-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <Move size={12} />
                    </button>
                    <button type="button" onClick={() => buangGambar(i)} aria-label="Buang" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer text-inkmuted">
                    {memuatNaikSlot === i ? <span className="text-[10px]">Memuat naik…</span> : <Plus size={20} />}
                    <input type="file" accept="image/*" onChange={(e) => pilihGambarSlot(i, e)} className="hidden" disabled={memuatNaikSlot === i} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Tandatangan</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BlokTtdBank
              label="Setiausaha (tandatangan)"
              senaraiNama={namaSetiausahaPilihan}
              nama={data.namaSetiausaha}
              ttdUrl={data.ttdSetiausahaUrl}
              adaTersimpan={Boolean(cariTtdTersimpan(unit, data.namaSetiausaha))}
              onPilihNama={pilihNamaSetiausaha}
              onTandatangan={() => setTunjukTtd('setiausaha')}
              onGunaTersimpan={() => u('ttdSetiausahaUrl', cariTtdTersimpan(unit, data.namaSetiausaha) || '')}
              onPadamTtd={() => u('ttdSetiausahaUrl', '')}
            />
            <BlokTtdBank
              label="Guru Penasihat (tandatangan)"
              senaraiNama={namaGuruPilihan}
              nama={data.namaGuruTtd}
              ttdUrl={data.ttdGuruUrl}
              adaTersimpan={Boolean(cariTtdTersimpan(unit, data.namaGuruTtd))}
              onPilihNama={pilihNamaGuru}
              onTandatangan={() => setTunjukTtd('guru')}
              onGunaTersimpan={() => u('ttdGuruUrl', cariTtdTersimpan(unit, data.namaGuruTtd) || '')}
              onPadamTtd={() => u('ttdGuruUrl', '')}
            />
            <BlokTtd label="GPK Kokurikulum" nama={data.namaGPK} ttdUrl={data.ttdGPKUrl} onNama={(v) => u('namaGPK', v)} onTandatangan={() => setTunjukTtd('gpk')} onPadamTtd={() => u('ttdGPKUrl', '')} />
          </div>
          {!data.namaSetiausaha && (
            <p className="text-[11px] text-inkmuted mt-2">⚠ Tiada Setiausaha dilantik lagi untuk unit ni - pergi "Jawatankuasa UBKS" untuk lantik, atau taip nama terus.</p>
          )}
          {namaGuruPilihan.length === 0 && (
            <p className="text-[11px] text-inkmuted mt-2">⚠ Tiada Guru Penasihat ditetapkan lagi untuk unit ni - pergi halaman Unit (Murid UBKS) untuk isi, atau taip nama terus.</p>
          )}
        </div>

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

        <div className="flex gap-3 pt-2 border-t border-border sticky bottom-0 bg-surface pb-2">
          <button onClick={simpan} disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : rekodSediaAda ? 'Kemaskini Laporan' : 'Simpan Laporan'}
          </button>
          <button onClick={cetak} disabled={mencetak} className="h-12 px-4 rounded-card border border-border text-sm font-medium text-ink flex items-center gap-1.5 disabled:opacity-60">
            <Printer size={15} /> {mencetak ? (dirty ? 'Menyimpan…' : 'Menyediakan…') : 'Cetak'}
          </button>
        </div>
      </div>

      <PemotongGambarModal
        open={slotCrop !== null}
        gambarSrc={gambarMentah}
        onTutup={() => setSlotCrop(null)}
        onSah={crophasilSah}
        onGagal={(mesej) => { setSlotCrop(null); setRalat(mesej) }}
      />
      <TandatanganModal open={tunjukTtd !== null} onTutup={() => setTunjukTtd(null)} onSah={tandatanganSah} />

      {dataCetak && <CetakLaporanUBKS data={dataCetak.data} unit={dataCetak.unit} perjumpaan={dataCetak.perjumpaan} />}
    </div>
  )
}
