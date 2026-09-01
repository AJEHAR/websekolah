import { useState } from 'react'
import { Sparkles, Upload, X, PenLine, Plus, Move } from 'lucide-react'
import { muatNaikKeDrive, janaAiOpr } from '../../lib/driveUpload.js'
import PemotongGambarModal from './PemotongGambarModal.jsx'
import TandatanganModal from './TandatanganModal.jsx'

const MEDAN_KOSONG = {
  unit: '', nama: '', hari: '', tarikh: '', masa: '', tempat: '', sasaran: '',
  objektif: '', aktiviti: '', kekuatan: '', kelemahan: '', penambahbaikan: '',
  gambar: [null, null, null, null],
  namaDisediakan: '', jawatanDisediakan: '', tandaTanganDisediakanUrl: '',
  namaDisahkan: '', jawatanDisahkan: '', tandaTanganDisahkanUrl: '',
  disahkanAktif: true,
  latarBelakangUrl: '',
  layoutCetak: 'gaya1',
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

export default function OPRForm({ dataAwal, senaraiUnit, senaraiLatarBelakang, onSimpan, onBatal, menyimpan }) {
  const [data, setData] = useState({ ...MEDAN_KOSONG, ...dataAwal })
  const [ralat, setRalat] = useState(null)
  const [menjanaAI, setMenjanaAI] = useState(false)

  const [slotCrop, setSlotCrop] = useState(null) // index slot gambar sedang di-crop
  const [gambarMentah, setGambarMentah] = useState(null) // src gambar sebelum crop
  const [memuatNaikSlot, setMemuatNaikSlot] = useState(null)
  const [tunjukTandatangan, setTunjukTandatangan] = useState(null) // 'disediakan' | 'disahkan'
  const [memuatNaikTtd, setMemuatNaikTtd] = useState(false)

  function u(kunci, nilai) {
    setData((d) => ({ ...d, [kunci]: nilai }))
  }

  async function janaAI() {
    if (!data.objektif.trim() && !data.aktiviti.trim()) {
      setRalat('Sila isi sekurang-kurangnya Objektif Program atau Aktiviti sebelum menjana dengan AI.')
      return
    }
    setRalat(null)
    setMenjanaAI(true)
    try {
      const hasil = await janaAiOpr(data)
      setData((d) => ({ ...d, kekuatan: hasil.kekuatan, kelemahan: hasil.kelemahan, penambahbaikan: hasil.penambahbaikan }))
    } catch (err) {
      setRalat(err.message || 'Gagal jana AI. Sila cuba lagi.')
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

  // Laras semula kedudukan/pemotongan gambar yang DAH dimuat naik - guna
  // gambar sedia ada (URL) sebagai sumber, staff tak perlu cari & upload
  // fail asal semula setiap kali nak tukar fokus/kedudukan gambar.
  function larasGambarSlot(i) {
    setGambarMentah(data.gambar[i])
    setSlotCrop(i)
  }

  async function crophasilSah(blob) {
    const i = slotCrop
    setSlotCrop(null)
    setMemuatNaikSlot(i)
    try {
      const fail = new File([blob], `gambar-opr-${i}.jpg`, { type: 'image/jpeg' })
      const hasil = await muatNaikKeDrive(fail, 'opr')
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
    setData((d) => {
      const gambar = [...d.gambar]
      gambar[i] = null
      return { ...d, gambar }
    })
  }

  async function tandatanganSah(blob) {
    const kunci = tunjukTandatangan
    setTunjukTandatangan(null)
    setMemuatNaikTtd(true)
    try {
      const fail = new File([blob], `ttd-${kunci}.png`, { type: 'image/png' })
      const hasil = await muatNaikKeDrive(fail, 'opr')
      u(kunci === 'disediakan' ? 'tandaTanganDisediakanUrl' : 'tandaTanganDisahkanUrl', hasil.url)
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik tandatangan.')
    } finally {
      setMemuatNaikTtd(false)
    }
  }

  async function hantar() {
    setRalat(null)
    if (!data.nama.trim()) return setRalat('Sila isi Nama Program.')
    try {
      await onSimpan(data)
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">1. Gaya Cetakan</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => u('layoutCetak', 'gaya1')}
            className="rounded-card border-2 p-3 text-left"
            style={{ borderColor: data.layoutCetak === 'gaya1' ? '#C8102E' : '#E5E5E5' }}
          >
            <div className="h-20 rounded bg-white border border-border mb-2 p-1.5 flex flex-col gap-0.5">
              <div className="h-2 bg-gray-200 rounded-sm w-1/2 mx-auto" />
              <div className="flex-1 grid grid-cols-2 gap-0.5 mt-1">
                <div className="bg-gray-100 rounded-sm" />
                <div className="bg-gray-100 rounded-sm" />
              </div>
            </div>
            <p className="text-xs font-semibold text-ink">Gaya 1 - Kotak Ringkas</p>
            <p className="text-[10px] text-inkmuted">Latar putih, kotak bersempadan hitam, gambar 4 sebaris</p>
          </button>
          <button
            type="button"
            onClick={() => u('layoutCetak', 'gaya2')}
            className="rounded-card border-2 p-3 text-left"
            style={{ borderColor: data.layoutCetak === 'gaya2' ? '#C8102E' : '#E5E5E5' }}
          >
            <div className="h-20 rounded bg-white border border-border mb-2 overflow-hidden flex flex-col">
              <div className="h-5 shrink-0" style={{ backgroundColor: '#1B4D2E' }} />
              <div className="flex-1 p-1.5 flex gap-1">
                <div className="flex-1 bg-gray-100 rounded-sm" />
                <div className="w-4 bg-gray-200 rounded-sm" />
              </div>
            </div>
            <p className="text-xs font-semibold text-ink">Gaya 2 - Kepala Hijau</p>
            <p className="text-[10px] text-inkmuted">Kepala hijau ikut Unit, gambar sekolum di kanan</p>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">2. Tetapan Latar Belakang</p>
        <select
          value={data.latarBelakangUrl}
          onChange={(e) => u('latarBelakangUrl', e.target.value)}
          className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">Tiada (Putih Bersih)</option>
          {senaraiLatarBelakang.map((l) => (
            <option key={l.id} value={l.gambarUrl}>{l.namaTema}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">3. Maklumat Asas</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Unit / Kategori</label>
            <select value={data.unit} onChange={(e) => u('unit', e.target.value)} className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm">
              <option value="">-- Pilih Unit --</option>
              {senaraiUnit.map((un) => (
                <option key={un.id} value={un.namaUnit}>{un.namaUnit}</option>
              ))}
            </select>
          </div>
          <Medan label="Nama Program" value={data.nama} onChange={(v) => u('nama', v)} />
          <div className="grid grid-cols-3 gap-2">
            <Medan label="Hari" value={data.hari} onChange={(v) => u('hari', v)} />
            <Medan label="Tarikh" value={data.tarikh} onChange={(v) => u('tarikh', v)} placeholder="14 Mei 2026" />
            <Medan label="Masa" value={data.masa} onChange={(v) => u('masa', v)} placeholder="8.00 Pagi" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Medan label="Tempat" value={data.tempat} onChange={(v) => u('tempat', v)} />
            <Medan label="Kumpulan Sasaran" value={data.sasaran} onChange={(v) => u('sasaran', v)} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">4. Laporan Pengurusan</p>
        <div className="space-y-3">
          <Medan label="Objektif Program" value={data.objektif} onChange={(v) => u('objektif', v)} textarea />
          <Medan label="Aktiviti" value={data.aktiviti} onChange={(v) => u('aktiviti', v)} textarea />

          <div className="p-3 rounded-card bg-[#F5F3FF] border border-[#C4B5FD]">
            <p className="text-xs text-[#5B21B6] mb-2">✨ Isi <b>Objektif</b> & <b>Aktiviti</b> dahulu, kemudian jana dengan AI</p>
            <button
              type="button"
              onClick={janaAI}
              disabled={menjanaAI}
              className="w-full h-10 rounded-card bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Sparkles size={14} /> {menjanaAI ? 'AI sedang menjana…' : 'Jana AI — Kekuatan, Kelemahan & Penambahbaikan'}
            </button>
          </div>

          <Medan label="Kekuatan" value={data.kekuatan} onChange={(v) => u('kekuatan', v)} textarea />
          <Medan label="Kelemahan" value={data.kelemahan} onChange={(v) => u('kelemahan', v)} textarea />
          <Medan label="Penambahbaikan" value={data.penambahbaikan} onChange={(v) => u('penambahbaikan', v)} textarea />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">5. Gambar Aktiviti</p>
        <p className="text-[11px] text-inkmuted mb-2">Tekan ikon <Move size={10} className="inline" /> pada gambar bila-bila untuk laras semula kedudukan/fokus, tanpa perlu upload semula.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-square rounded-card border-2 border-dashed border-border bg-base overflow-hidden">
              {data.gambar[i] ? (
                <>
                  <img src={data.gambar[i]} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => larasGambarSlot(i)}
                    aria-label="Laraskan kedudukan gambar"
                    title="Laraskan kedudukan"
                    className="absolute bottom-1 left-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <Move size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => buangGambar(i)}
                    aria-label="Buang gambar"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex items-center justify-center cursor-pointer text-inkmuted">
                  {memuatNaikSlot === i ? (
                    <span className="text-[10px]">Memuat naik…</span>
                  ) : (
                    <Plus size={20} />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => pilihGambarSlot(i, e)} className="hidden" disabled={memuatNaikSlot === i} />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">6. Pengesahan Dokumen</p>
        <div className="space-y-4">
          <BlokTandatangan
            label="Disediakan Oleh"
            nama={data.namaDisediakan}
            jawatan={data.jawatanDisediakan}
            ttdUrl={data.tandaTanganDisediakanUrl}
            memuatNaik={memuatNaikTtd}
            onNama={(v) => u('namaDisediakan', v)}
            onJawatan={(v) => u('jawatanDisediakan', v)}
            onTandatangan={() => setTunjukTandatangan('disediakan')}
            onPadamTtd={() => u('tandaTanganDisediakanUrl', '')}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink">Disahkan Oleh</span>
            <button
              type="button"
              onClick={() => u('disahkanAktif', !data.disahkanAktif)}
              role="switch"
              aria-checked={data.disahkanAktif}
              className={`relative h-6 w-11 rounded-full transition-colors ${data.disahkanAktif ? 'bg-brand-red' : 'bg-border'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${data.disahkanAktif ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {data.disahkanAktif && (
            <BlokTandatangan
              label={null}
              nama={data.namaDisahkan}
              jawatan={data.jawatanDisahkan}
              ttdUrl={data.tandaTanganDisahkanUrl}
              memuatNaik={memuatNaikTtd}
              onNama={(v) => u('namaDisahkan', v)}
              onJawatan={(v) => u('jawatanDisahkan', v)}
              onTandatangan={() => setTunjukTandatangan('disahkan')}
              onPadamTtd={() => u('tandaTanganDisahkanUrl', '')}
            />
          )}
        </div>
      </div>

      {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

      <div className="flex gap-3 pt-2 border-t border-border">
        <button onClick={hantar} disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Laporan'}
        </button>
        <button onClick={onBatal} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
          Batal
        </button>
      </div>

      <PemotongGambarModal
        open={slotCrop !== null}
        gambarSrc={gambarMentah}
        onTutup={() => setSlotCrop(null)}
        onSah={crophasilSah}
        onGagal={(mesej) => { setSlotCrop(null); setRalat(mesej) }}
      />
      <TandatanganModal
        open={tunjukTandatangan !== null}
        onTutup={() => setTunjukTandatangan(null)}
        onSah={tandatanganSah}
      />
    </div>
  )
}

function BlokTandatangan({ label, nama, jawatan, ttdUrl, memuatNaik, onNama, onJawatan, onTandatangan, onPadamTtd }) {
  return (
    <div>
      {label && <p className="text-xs font-medium text-ink mb-2">{label}</p>}
      {ttdUrl ? (
        <div className="relative h-20 rounded-card border border-border bg-white flex items-center justify-center mb-2">
          <img src={ttdUrl} alt="Tandatangan" className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={onPadamTtd} className="absolute top-1 right-1 text-[10px] text-brand-red font-semibold">Padam</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onTandatangan}
          disabled={memuatNaik}
          className="w-full h-11 rounded-card border border-dashed border-border text-xs font-semibold text-inkmuted flex items-center justify-center gap-1.5 mb-2 disabled:opacity-60"
        >
          <PenLine size={14} /> {memuatNaik ? 'Memuat naik…' : 'Klik Untuk Tandatangan'}
        </button>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={nama} onChange={(e) => onNama(e.target.value)} placeholder="Nama Penuh" className="h-10 px-3 rounded-card border border-border bg-surface text-sm" />
        <input type="text" value={jawatan} onChange={(e) => onJawatan(e.target.value)} placeholder="Jawatan" className="h-10 px-3 rounded-card border border-border bg-surface text-sm" />
      </div>
    </div>
  )
}
