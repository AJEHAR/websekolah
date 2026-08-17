import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'

const SAIZ_MAKS_MB = 20

export default function RPTModal({ open, laporan, profiles, panitiaSenarai, kategoriSenarai, penggunaSendiri, onClose, onSimpan }) {
  const [tahunSesi, setTahunSesi] = useState(laporan?.tahunSesi ?? String(new Date().getFullYear()))
  const [panitia, setPanitia] = useState(laporan?.panitia ?? '')
  const [kategori, setKategori] = useState(laporan?.kategori ?? '')
  const [mataPelajaran, setMataPelajaran] = useState(laporan?.mataPelajaran ?? '')
  const [tahunDarjah, setTahunDarjah] = useState(laporan?.tahunDarjah ?? '')
  const [guruEmel, setGuruEmel] = useState(laporan?.guruEmel ?? penggunaSendiri.emel)
  const [fail, setFail] = useState(null)
  const [namaFailSediaAda, setNamaFailSediaAda] = useState(laporan?.fail?.fileName ?? null)
  const [ralat, setRalat] = useState(null)
  const [memuatNaik, setMemuatNaik] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  function pilihFail(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      setRalat('Sila pilih fail PDF sahaja.')
      e.target.value = ''
      return
    }
    if (f.size > SAIZ_MAKS_MB * 1024 * 1024) {
      setRalat(`Fail terlalu besar (maksimum ${SAIZ_MAKS_MB}MB).`)
      e.target.value = ''
      return
    }
    setRalat(null)
    setFail(f)
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!tahunSesi.trim()) return setRalat('Sila isi Tahun/Sesi.')
    if (!panitia) return setRalat('Sila pilih Panitia.')
    if (!kategori) return setRalat('Sila pilih Kategori.')
    if (!mataPelajaran.trim()) return setRalat('Sila isi Nama Mata Pelajaran.')
    if (!tahunDarjah.trim()) return setRalat('Sila isi Tahun/Darjah.')
    if (!guruEmel) return setRalat('Sila pilih Nama Guru.')
    if (!fail && !laporan) return setRalat('Sila muat naik fail PDF.')

    const guru = profiles.find((p) => p.emel === guruEmel)

    setMenyimpan(true)
    try {
      let dataFail = laporan?.fail ?? null
      if (fail) {
        setMemuatNaik(true)
        const hasil = await muatNaikKeDrive(fail, 'rpt')
        dataFail = hasil
        setMemuatNaik(false)
      }

      await onSimpan({
        tahunSesi: tahunSesi.trim(),
        panitia,
        kategori,
        mataPelajaran: mataPelajaran.trim(),
        tahunDarjah: tahunDarjah.trim(),
        guruEmel,
        guruNama: guru?.nama ?? '',
        fail: dataFail,
        dimuatNaikOlehEmel: penggunaSendiri.emel,
        dimuatNaikOleh: penggunaSendiri.nama,
      })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan laporan RPT.')
      setMemuatNaik(false)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{laporan ? 'Edit RPT' : 'Muat Naik RPT'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="tahunSesiRPT" className="block text-sm font-medium text-ink mb-1">Tahun / Sesi <span className="text-brand-red">*</span></label>
            <input
              id="tahunSesiRPT"
              type="text"
              required
              placeholder="contoh: 2026"
              value={tahunSesi}
              onChange={(e) => setTahunSesi(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="panitiaRPT" className="block text-sm font-medium text-ink mb-1">Panitia <span className="text-brand-red">*</span></label>
            <select
              id="panitiaRPT"
              required
              value={panitia}
              onChange={(e) => setPanitia(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih panitia --</option>
              {panitiaSenarai.map((p) => (
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>
            {panitiaSenarai.length === 0 && (
              <p className="text-xs text-inkmuted mt-1">Belum ada panitia disetup. Minta admin tambah di Panel Admin &gt; Panitia RPT.</p>
            )}
          </div>

          <div>
            <label htmlFor="kategoriRPT" className="block text-sm font-medium text-ink mb-1">Kategori <span className="text-brand-red">*</span></label>
            <select
              id="kategoriRPT"
              required
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih kategori --</option>
              {kategoriSenarai.map((k) => (
                <option key={k.id} value={k.nama}>{k.nama}</option>
              ))}
            </select>
            {kategoriSenarai.length === 0 && (
              <p className="text-xs text-inkmuted mt-1">Belum ada kategori disetup. Minta admin tambah di Panel Admin &gt; Kategori RPT.</p>
            )}
          </div>

          <div>
            <label htmlFor="mataPelajaranRPT" className="block text-sm font-medium text-ink mb-1">Nama Mata Pelajaran <span className="text-brand-red">*</span></label>
            <input
              id="mataPelajaranRPT"
              type="text"
              required
              placeholder="contoh: Bahasa Melayu"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="tahunDarjahRPT" className="block text-sm font-medium text-ink mb-1">Tahun / Darjah <span className="text-brand-red">*</span></label>
            <input
              id="tahunDarjahRPT"
              type="text"
              required
              placeholder="contoh: Tahun 3"
              value={tahunDarjah}
              onChange={(e) => setTahunDarjah(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="guruRPT" className="block text-sm font-medium text-ink mb-1">Nama Guru <span className="text-brand-red">*</span></label>
            <select
              id="guruRPT"
              required
              value={guruEmel}
              onChange={(e) => setGuruEmel(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.emel}>{p.nama}</option>
              ))}
            </select>
            <p className="text-xs text-inkmuted mt-1">Terpilih nama anda secara automatik - tukar kalau muat naik bagi pihak guru lain.</p>
          </div>

          <div>
            <label htmlFor="failRPT" className="block text-sm font-medium text-ink mb-1">
              Fail RPT (PDF) {laporan && <span className="font-normal text-inkmuted">- pilihan, kekal fail sedia ada kalau tak ganti</span>}
            </label>
            <label
              htmlFor="failRPT"
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-card border border-dashed border-border bg-base text-sm cursor-pointer hover:bg-white"
            >
              <Upload size={16} className="text-inkmuted" />
              <span className="text-inkmuted truncate">
                {fail ? fail.name : namaFailSediaAda ? `Ganti: ${namaFailSediaAda}` : 'Pilih fail PDF…'}
              </span>
            </label>
            <input id="failRPT" type="file" accept="application/pdf" onChange={pilihFail} className="hidden" />
          </div>

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {memuatNaik ? 'Memuat naik fail…' : menyimpan ? 'Menyimpan…' : 'Hantar'}
            </button>
            <button type="button" onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
