import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { tambahOprUnit, padamOprUnit } from '../../hooks/useOprUnit.js'

export default function UrusUnitOPRModal({ open, senarai, seksyen, user, onClose, onSelesai }) {
  const { konfirm } = useDialog()
  const [namaBaru, setNamaBaru] = useState('')
  const [menambah, setMenambah] = useState(false)

  if (!open) return null

  async function tambah() {
    if (!namaBaru.trim()) return
    setMenambah(true)
    try {
      await tambahOprUnit(seksyen, namaBaru.trim(), user.uid)
      setNamaBaru('')
      onSelesai()
    } finally {
      setMenambah(false)
    }
  }

  async function padam(id) {
    if (!(await konfirm('Padam unit ini?', { bahaya: true }))) return
    await padamOprUnit(id)
    onSelesai()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Urus Unit/Kategori</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama unit baharu…"
            className="flex-1 h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
          <button onClick={tambah} disabled={menambah} className="h-10 w-10 rounded-card bg-brand-red text-white flex items-center justify-center shrink-0 disabled:opacity-60">
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          {senarai.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada unit lagi.</p>
          ) : (
            senarai.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-card bg-base">
                <span className="text-sm text-ink">{u.namaUnit}</span>
                <button onClick={() => padam(u.id)} aria-label="Padam" className="p-1 text-brand-red">
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
