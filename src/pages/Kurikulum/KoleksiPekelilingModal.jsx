import { useState } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'

export default function KoleksiPekelilingModal({ open, rekod, onClose, onSimpan }) {
  const [perkara, setPerkara] = useState(rekod?.perkara ?? '')
  const [catatan, setCatatan] = useState(rekod?.catatan ?? '')
  const [fail, setFail] = useState(null)
  const [memuatNaik, setMemuatNaik] = useState(false)
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

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
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!perkara.trim()) return setRalat('Sila isi Perkara/Nama Dokumen.')
    if (!rekod && !fail) return setRalat('Sila muat naik dokumen.')

    setMenyimpan(true)
    try {
      let dataFail = {}
      if (fail) {
        setMemuatNaik(true)
        const hasil = await muatNaikKeDrive(fail, 'pekeliling')
        dataFail = { failUrl: hasil.previewUrl, namaFail: fail.name, jenisFail: fail.type }
        setMemuatNaik(false)
      }
      await onSimpan({ perkara: perkara.trim(), catatan: catatan.trim(), ...dataFail })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
      setMemuatNaik(false)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{rekod ? 'Edit Dokumen' : 'Tambah Dokumen'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="perkara" className="block text-sm font-medium text-ink mb-1">Perkara / Nama Dokumen <span className="text-brand-red">*</span></label>
            <input
              id="perkara"
              type="text"
              value={perkara}
              onChange={(e) => setPerkara(e.target.value)}
              placeholder="cth. Pekeliling Ikhtisas Bil. 3/2026"
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="catatan" className="block text-sm font-medium text-ink mb-1">Catatan</label>
            <textarea
              id="catatan"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Nota tambahan (pilihan)…"
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="failPekeliling" className="block text-sm font-medium text-ink mb-1">
              Dokumen (PDF/Gambar/Word) {rekod && <span className="font-normal text-inkmuted">- pilihan, kekal fail sedia ada kalau tak ganti</span>}
            </label>
            <label
              htmlFor="failPekeliling"
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-card border border-dashed border-border bg-base text-sm cursor-pointer hover:bg-white"
            >
              <Upload size={16} className="text-inkmuted" />
              <span className="text-inkmuted truncate">
                {fail ? fail.name : rekod?.namaFail ? `Ganti: ${rekod.namaFail}` : 'Pilih fail…'}
              </span>
            </label>
            <input
              id="failPekeliling"
              type="file"
              accept="application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={pilihFail}
              className="hidden"
            />
            {rekod?.namaFail && !fail && (
              <p className="flex items-center gap-1.5 text-xs text-inkmuted mt-1.5">
                <FileText size={13} /> Fail sedia ada: {rekod.namaFail}
              </p>
            )}
          </div>

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {memuatNaik ? 'Memuat naik fail…' : menyimpan ? 'Menyimpan…' : 'Simpan'}
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
