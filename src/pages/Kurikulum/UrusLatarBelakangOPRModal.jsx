import { useState } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { tambahOprLatarBelakang, padamOprLatarBelakang } from '../../hooks/useOprLatarBelakang.js'

export default function UrusLatarBelakangOPRModal({ open, senarai, user, onClose, onSelesai }) {
  const { konfirm } = useDialog()
  const [namaBaru, setNamaBaru] = useState('')
  const [fail, setFail] = useState(null)
  const [memuatNaik, setMemuatNaik] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function tambah() {
    setRalat(null)
    if (!namaBaru.trim()) return setRalat('Sila isi nama tema.')
    if (!fail) return setRalat('Sila pilih gambar.')
    setMemuatNaik(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'opr')
      await tambahOprLatarBelakang(namaBaru.trim(), hasil.url, user.uid)
      setNamaBaru('')
      setFail(null)
      onSelesai()
    } catch (err) {
      setRalat(err.message || 'Gagal muat naik.')
    } finally {
      setMemuatNaik(false)
    }
  }

  async function padam(id) {
    if (!(await konfirm('Padam tema latar belakang ini?', { bahaya: true }))) return
    await padamOprLatarBelakang(id)
    onSelesai()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Urus Tema Latar Belakang</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama tema (cth. Sukan 2026)…"
            className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
          <label className="flex items-center justify-center gap-2 h-10 rounded-card border border-dashed border-border bg-base text-xs text-inkmuted cursor-pointer">
            <Upload size={14} /> {fail ? fail.name : 'Pilih gambar…'}
            <input type="file" accept="image/*" onChange={(e) => setFail(e.target.files?.[0] ?? null)} className="hidden" />
          </label>
          <button onClick={tambah} disabled={memuatNaik} className="w-full h-10 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
            {memuatNaik ? 'Memuat naik…' : 'Tambah Tema'}
          </button>
          {ralat && <p className="text-xs text-brand-red">{ralat}</p>}
        </div>

        <div className="space-y-1.5">
          {senarai.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada tema lagi.</p>
          ) : (
            senarai.map((l) => (
              <div key={l.id} className="flex items-center gap-2 p-2 rounded-card bg-base">
                <img src={l.gambarUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                <span className="text-sm text-ink flex-1 truncate">{l.namaTema}</span>
                <button onClick={() => padam(l.id)} aria-label="Padam" className="p-1 text-brand-red shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
