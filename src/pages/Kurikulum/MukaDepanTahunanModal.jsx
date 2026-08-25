import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { simpanMukaDepanTahunan } from '../../hooks/useMukaDepanTahunan.js'

export default function MukaDepanTahunanModal({ open, tahun, mukaSediaAda, user, onClose, onSelesai }) {
  const [fail, setFail] = useState(null)
  const [pratonton, setPratonton] = useState(null)
  const [memuatNaik, setMemuatNaik] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  function pilihFail(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 20 * 1024 * 1024) {
      setRalat('Fail terlalu besar (maksimum 20MB).')
      return
    }
    setRalat(null)
    setFail(f)
    setPratonton(URL.createObjectURL(f))
  }

  async function hantar(e) {
    e.preventDefault()
    if (!fail) return setRalat('Sila pilih gambar dulu.')
    setRalat(null)
    setMemuatNaik(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'kertasKerja')
      await simpanMukaDepanTahunan(tahun, hasil.url, user.uid)
      onSelesai()
      onClose()
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik. Sila cuba lagi.')
    } finally {
      setMemuatNaik(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Gambar Muka Depan {tahun}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-inkmuted mb-4">
          Reka bentuk ni akan dipakai untuk SEMUA kertas kerja tahun {tahun} - tajuk & anjuran setiap kertas kerja akan digabung terus atas gambar ni semasa cetak.
        </p>

        <form onSubmit={hantar} className="space-y-4">
          <label
            htmlFor="gambarMukaDepan"
            className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border bg-base text-sm cursor-pointer hover:bg-white overflow-hidden"
          >
            {pratonton || mukaSediaAda?.gambarUrl ? (
              <img src={pratonton || mukaSediaAda.gambarUrl} alt="Pratonton" className="w-full object-contain max-h-64" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-10">
                <Upload size={20} className="text-inkmuted" />
                <span className="text-inkmuted">Pilih gambar…</span>
              </div>
            )}
          </label>
          <input id="gambarMukaDepan" type="file" accept="image/*" onChange={pilihFail} className="hidden" />
          {fail && <p className="text-xs text-inkmuted">Fail dipilih: {fail.name}</p>}

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={memuatNaik || !fail} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {memuatNaik ? 'Memuat naik…' : 'Simpan'}
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
