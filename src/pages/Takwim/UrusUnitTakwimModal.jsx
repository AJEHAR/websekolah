import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { tambahTakwimUnit, padamTakwimUnit } from '../../hooks/useTakwimUnit.js'

// Warna palet cadangan (elak admin perlu fikir kod hex sendiri setiap kali)
const PALET_WARNA = ['#C8102E', '#2563EB', '#16A34A', '#F2C230', '#7C3AED', '#EA580C', '#0891B2', '#DB2777']

export default function UrusUnitTakwimModal({ open, senarai, user, onClose, onSelesai }) {
  const { konfirm } = useDialog()
  const [namaBaru, setNamaBaru] = useState('')
  const [warnaBaru, setWarnaBaru] = useState(PALET_WARNA[0])
  const [menambah, setMenambah] = useState(false)

  if (!open) return null

  async function tambah() {
    if (!namaBaru.trim()) return
    setMenambah(true)
    try {
      await tambahTakwimUnit(namaBaru.trim(), warnaBaru, user.uid)
      setNamaBaru('')
      onSelesai()
    } finally {
      setMenambah(false)
    }
  }

  async function padam(id) {
    if (!(await konfirm('Padam unit/panitia ini? Acara sedia ada yang guna unit ni akan kekal tapi tanpa label unit.', { bahaya: true }))) return
    await padamTakwimUnit(id)
    onSelesai()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Urus Unit/Panitia</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama unit/panitia baharu…"
            className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm mb-2"
          />
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {PALET_WARNA.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWarnaBaru(w)}
                aria-label={`Warna ${w}`}
                className="h-6 w-6 rounded-full shrink-0"
                style={{ backgroundColor: w, outline: warnaBaru === w ? '2px solid #1A1A1A' : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>
          <button onClick={tambah} disabled={menambah} className="w-full h-10 rounded-card bg-brand-red text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
            <Plus size={14} /> Tambah Unit
          </button>
        </div>

        <div className="space-y-1.5">
          {senarai.map((u) => (
            <div key={u.id} className="flex items-center gap-2 p-2 rounded-card bg-base">
              <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: u.warna }} />
              <span className="text-sm text-ink flex-1 truncate">{u.namaUnit}</span>
              <button onClick={() => padam(u.id)} aria-label="Padam" className="p-1 text-brand-red shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
