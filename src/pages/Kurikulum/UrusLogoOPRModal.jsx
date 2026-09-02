import { useState } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { simpanOprLogo } from '../../hooks/useOprLogo.js'

// Urus sehingga 3 logo yang dipaparkan sebaris di atas setiap cetakan OPR
// (Gaya 1 & Gaya 2) - kosongkan semua untuk kembali ke logo sekolah lalai.
export default function UrusLogoOPRModal({ open, logo, seksyen, user, onClose, onSelesai }) {
  const [senarai, setSenarai] = useState(logo ?? [])
  const [memuatNaik, setMemuatNaik] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function tambahFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    if (senarai.length >= 3) {
      setRalat('Maksimum 3 logo sahaja - padam satu dulu untuk tambah baru.')
      return
    }
    setRalat(null)
    setMemuatNaik(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'opr')
      setSenarai((s) => [...s, hasil.url])
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik.')
    } finally {
      setMemuatNaik(false)
      e.target.value = ''
    }
  }

  function buang(i) {
    setSenarai((s) => s.filter((_, idx) => idx !== i))
  }

  async function simpan() {
    setMenyimpan(true)
    try {
      await simpanOprLogo(seksyen, senarai, user.uid)
      onSelesai()
      onClose()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Logo Cetakan OPR</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-4">Sehingga 3 logo, dipaparkan sebaris di kepala setiap cetakan OPR. Kosongkan semua untuk kembali ke logo sekolah asal.</p>

        <div className="flex items-center gap-2 mb-4">
          {senarai.map((url, i) => (
            <div key={i} className="relative h-16 w-16 rounded-card border border-border bg-base overflow-hidden shrink-0">
              <img src={url} alt="" className="h-full w-full object-contain" />
              <button
                onClick={() => buang(i)}
                aria-label="Buang logo"
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {senarai.length < 3 && (
            <label className="h-16 w-16 rounded-card border-2 border-dashed border-border flex items-center justify-center cursor-pointer shrink-0 text-inkmuted">
              {memuatNaik ? <span className="text-[9px]">…</span> : <Upload size={16} />}
              <input type="file" accept="image/*" onChange={tambahFail} className="hidden" disabled={memuatNaik} />
            </label>
          )}
        </div>

        {ralat && <p className="text-xs text-brand-red mb-3">{ralat}</p>}

        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
