import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext, Link } from 'react-router-dom'
import { ArrowLeft, Plus, PenLine, Move, Printer, X, RotateCcw } from 'lucide-react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { usePikebm } from '../../hooks/usePikebm.js'
import { useUnitUBKSSatu, kemaskiniUnit } from '../../hooks/useUnitUBKS.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useDialog } from '../../context/DialogContext.jsx'
import { muatkanLaporanUBKS, simpanLaporanUBKS } from '../../hooks/useLaporanUBKS.js'
import { muatkanPerancangan } from '../../hooks/usePerancanganUBKS.js'
import { senaraiGuru, cariTtdTersimpan, upsertTtdTersimpan } from './unitHelpers.js'
import PemotongGambarModal from '../Kurikulum/PemotongGambarModal.jsx'
import TandatanganModal from '../Kurikulum/TandatanganModal.jsx'
import CetakLaporanUBKS from './CetakLaporanUBKS.jsx'

const MEDAN_KOSONG = {
  tarikh: '', masa: '', tempat: '', bilAhliHadir: '', guruPenasihat: '',
  laporanAktiviti: '', refleksi: '',
  pikebmTajuk: '', pikebmObjektif: '',
  nilaiTeras: '', nilaiAktiviti: '',
  gambar: [null, null, null, null],
  namaSetiausaha: '', ttdSetiausahaUrl: '',
  namaGuruTtd: '', ttdGuruUrl: '',
  namaGPK: '', ttdGPKUrl: '',
}

function Medan({ label, value, onChange, textarea, placeholder }) {
  const Komponen = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      <Komponen
        type={textarea ? undefined : 'text'}
        rows={textarea ? 3 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 rounded-card border border-border bg-surface text-sm ${textarea ? 'py-2 resize-y' : 'h-10'}`}
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

// Blok tandatangan dengan BANK per-unit - dropdown nama (dari Guru
// Penasihat/Jawatankuasa unit ni, BUKAN semua staff sekolah - relevan
// sahaja) + tandatangan tersimpan automatik terpakai bila nama sepadan
// (staff tak perlu lukis berulang). Kalau guru biasa tak hadir, staff
// tukar terus ke nama lain dalam dropdown - tandatangan berbeza ikut
// nama dipilih.
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

// Halaman PENUH (bukan popup lagi) untuk SATU Laporan Aktiviti Perjumpaan
// - subpage /eubks/laporan-ubks/:unitId/:perjumpaan. Borang panjang ni
// jauh lebih selesa jadi halaman sendiri (scroll biasa, boleh bookmark/
// share pautan terus ke laporan tertentu) berbanding popup kecil.
export default function LaporanUBKSDetail() {
  const { unitId, perjumpaan: perjumpaanStr } = useParams()
  const perjumpaan = Number(perjumpaanStr)
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { unit, loading: loadingUnit } = useUnitUBKSSatu(unitId)
  const { senarai: senaraiPikebm } = usePikebm()
  const [dataCetak, setDataCetak] = useCetak()
  const { konfirm } = useDialog()

  const [data, setData] = useState(MEDAN_KOSONG)
  const [memuatkan, setMemuatkan] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)
  const [mencetak, setMencetak] = useState(false)
  const [ralat, setRalat] = useState(null)
  const [rujukanPerancangan, setRujukanPerancangan] = useState(null)
  const [dirty, setDirty] = useState(false)

  const [slotCrop, setSlotCrop] = useState(null)
  const [gambarMentah, setGambarMentah] = useState(null)
  const [memuatNaikSlot, setMemuatNaikSlot] = useState(null)
  const [tunjukTtd, setTunjukTtd] = useState(null)

  useEffect(() => {
    if (!unit) return
    let batal = false
    setMemuatkan(true)
    ;(async () => {
      const [sediaAda, perancangan] = await Promise.all([
        muatkanLaporanUBKS(unit.tahunSesi, unit.id, perjumpaan),
        muatkanPerancangan(unit.id),
      ])
      if (batal) return
      const slotPerancangan = perancangan?.senaraiPerjumpaan?.find((p) => p.perjumpaan === perjumpaan)
      setRujukanPerancangan(slotPerancangan?.perancangan || null)
      if (sediaAda) {
        setData({ ...MEDAN_KOSONG, ...sediaAda })
      } else {
        const setiausaha = unit.ahli?.find((a) => a.jawatan?.toLowerCase().includes('setiausaha'))
        // unit.guruPenasihat rekod lama = string, rekod baru = array
        // [{nama, tahunDarjah}] - gabung jadi teks "Nama (Tahun X), Nama2"
        // untuk medan Laporan (teks bebas, boleh edit); nama guru PERTAMA
        // sahaja dijadikan lalai tandatangan (staff boleh tukar kalau perlu).
        const senaraiGpArr = senaraiGuru(unit)
        const gpTeks = senaraiGpArr.map((g) => (g.tahunDarjah ? `${g.nama} (${g.tahunDarjah})` : g.nama)).join(', ')
        const namaGuruLalai = senaraiGpArr[0]?.nama || ''
        const namaSetiausahaLalai = setiausaha?.nama || ''
        setData({
          ...MEDAN_KOSONG,
          tarikh: slotPerancangan?.tarikh || '',
          guruPenasihat: gpTeks,
          namaGuruTtd: namaGuruLalai,
          ttdGuruUrl: cariTtdTersimpan(unit, namaGuruLalai) || '',
          namaSetiausaha: namaSetiausahaLalai,
          ttdSetiausahaUrl: cariTtdTersimpan(unit, namaSetiausahaLalai) || '',
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

  // Amaran kalau tinggalkan page (tutup tab/refresh) sedangkan ada
  // perubahan belum Simpan - elak kerja hilang senyap.
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
    setData((d) => ({ ...d, pikebmTajuk: tajuk, pikebmObjektif: item?.objektif ?? d.pikebmObjektif }))
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

      // Setiausaha & Guru Penasihat - simpan ke BANK tandatangan unit ni
      // automatik (bukan GPK Kokurikulum, sebab dia bukan "orang unit ni"
      // - tandatangan dia manual setiap kali, macam sebelum ni).
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

  // Cetak - kalau ada perubahan belum simpan, SIMPAN DULU secara automatik
  // sebelum cetak (elak staff anggap "cetak = dah simpan" sedangkan
  // sebenarnya data tu belum masuk pangkalan data).
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
        {rujukanPerancangan && (
          <p className="text-xs text-inkmuted p-2.5 rounded-card bg-base">📋 Perancangan asal: {rujukanPerancangan}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Medan label="Tarikh (auto dari Perancangan)" value={data.tarikh} onChange={(v) => u('tarikh', v)} placeholder="14/03/2026" />
          <Medan label="Masa" value={data.masa} onChange={(v) => u('masa', v)} placeholder="4.00 petang" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Medan label="Tempat" value={data.tempat} onChange={(v) => u('tempat', v)} />
          <Medan label="Bil. Ahli Hadir (auto dari Kehadiran)" value={data.bilAhliHadir} onChange={(v) => u('bilAhliHadir', v)} placeholder="24" />
        </div>
        <Medan label="Guru Penasihat (ringkasan untuk teks laporan)" value={data.guruPenasihat} onChange={(v) => u('guruPenasihat', v)} />

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
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Penerapan Nilai Sivik Dalam Kokurikulum</p>
          <div className="space-y-2">
            <Medan label="Nilai Teras" value={data.nilaiTeras} onChange={(v) => u('nilaiTeras', v)} placeholder="cth. Kerjasama" />
            <Medan label="Aktiviti" value={data.nilaiAktiviti} onChange={(v) => u('nilaiAktiviti', v)} textarea />
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
          <p className="text-[11px] text-inkmuted mt-2">💡 Guru tak hadir? Tukar terus nama dalam dropdown Guru Penasihat (tandatangan) - tandatangan tersimpan (kalau ada) terus terpakai.</p>
        </div>

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

        <div className="flex gap-3 pt-2 border-t border-border sticky bottom-0 bg-surface pb-2">
          <button onClick={simpan} disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : 'Simpan Laporan'}
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
