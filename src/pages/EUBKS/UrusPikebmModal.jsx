import { useState } from 'react'
import { X, Plus, Pencil, Trash2 } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { tambahPikebm, kemaskiniPikebm, padamPikebm } from '../../hooks/usePikebm.js'

export default function UrusPikebmModal({ open, senarai, onClose, onSelesai }) {
  const { konfirm } = useDialog()
  const [idEdit, setIdEdit] = useState(null)
  const [tajuk, setTajuk] = useState('')
  const [objektif, setObjektif] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  function bukaTambah() {
    setIdEdit('baru')
    setTajuk('')
    setObjektif('')
    setRalat(null)
  }

  function bukaEdit(p) {
    setIdEdit(p.id)
    setTajuk(p.tajuk)
    setObjektif(p.objektif)
    setRalat(null)
  }

  async function simpan() {
    if (!tajuk.trim() || !objektif.trim()) {
      setRalat('Sila isi Tajuk dan Objektif.')
      return
    }
    setMenyimpan(true)
    try {
      if (idEdit === 'baru') {
        await tambahPikebm(tajuk.trim(), objektif.trim())
      } else {
        await kemaskiniPikebm(idEdit, { tajuk: tajuk.trim(), objektif: objektif.trim() })
      }
      setIdEdit(null)
      onSelesai()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam(id) {
    if (!(await konfirm('Padam aktiviti PIKeBM ini?', { bahaya: true }))) return
    await padamPikebm(id)
    onSelesai()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-md p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Urus Senarai PIKeBM</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {idEdit ? (
          <div className="p-3 rounded-card bg-base mb-4 space-y-2">
            <input
              type="text"
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="Tajuk aktiviti (cth. Akulah Jaguh)"
              className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
            />
            <textarea
              rows={3}
              value={objektif}
              onChange={(e) => setObjektif(e.target.value)}
              placeholder="Objektif…"
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
            {ralat && <p className="text-xs text-brand-red">{ralat}</p>}
            <div className="flex gap-2">
              <button onClick={simpan} disabled={menyimpan} className="flex-1 h-10 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
                {menyimpan ? 'Menyimpan…' : 'Simpan'}
              </button>
              <button onClick={() => setIdEdit(null)} className="h-10 px-4 rounded-card border border-border text-xs font-medium text-ink">Batal</button>
            </div>
          </div>
        ) : (
          <button onClick={bukaTambah} className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold mb-4">
            <Plus size={14} /> Tambah Aktiviti PIKeBM
          </button>
        )}

        <div className="space-y-1.5">
          {senarai.map((p) => (
            <div key={p.id} className="flex items-start gap-2 p-2.5 rounded-card border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{p.tajuk}</p>
                <p className="text-xs text-inkmuted mt-0.5">{p.objektif}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => bukaEdit(p)} aria-label="Edit" className="p-1 rounded-card hover:bg-base text-inkmuted"><Pencil size={13} /></button>
                <button onClick={() => padam(p.id)} aria-label="Padam" className="p-1 rounded-card hover:bg-base text-brand-red"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
