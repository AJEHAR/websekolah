import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Check, X } from 'lucide-react'
import { useTugasBertugas, tambahTugas, kemaskiniTugas, padamTugas } from '../../hooks/useTugasBertugas.js'

export default function TugasBertugasSenarai({ isAdmin }) {
  const { senarai, loading, muatSemula } = useTugasBertugas()
  const [teksBaru, setTeksBaru] = useState('')
  const [idEdit, setIdEdit] = useState(null)
  const [teksEdit, setTeksEdit] = useState('')

  async function tambah(e) {
    e.preventDefault()
    if (!teksBaru.trim()) return
    const turutanBaru = senarai.length > 0 ? Math.max(...senarai.map((t) => t.turutan ?? 0)) + 1 : 1
    await tambahTugas(teksBaru.trim(), turutanBaru)
    setTeksBaru('')
    muatSemula()
  }

  function mulaEdit(tugas) {
    setIdEdit(tugas.id)
    setTeksEdit(tugas.perkara)
  }

  async function simpanEdit(id) {
    if (!teksEdit.trim()) return
    await kemaskiniTugas(id, { perkara: teksEdit.trim() })
    setIdEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!window.confirm('Padam tugasan ini?')) return
    await padamTugas(id)
    muatSemula()
  }

  async function pindah(index, arah) {
    const sasaran = index + arah
    if (sasaran < 0 || sasaran >= senarai.length) return
    const a = senarai[index]
    const b = senarai[sasaran]
    await Promise.all([
      kemaskiniTugas(a.id, { turutan: b.turutan ?? 0 }),
      kemaskiniTugas(b.id, { turutan: a.turutan ?? 0 }),
    ])
    muatSemula()
  }

  return (
    <div>
      {isAdmin && (
        <form onSubmit={tambah} className="flex gap-2 mb-4">
          <input
            type="text"
            value={teksBaru}
            onChange={(e) => setTeksBaru(e.target.value)}
            placeholder="Tambah tugasan baru…"
            className="flex-1 min-w-0 h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
          <button type="submit" aria-label="Tambah tugasan" className="h-11 w-11 rounded-card bg-brand-red text-white flex items-center justify-center shrink-0">
            <Plus size={18} />
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada tugasan lagi.</p>
      ) : (
        <ol className="space-y-2">
          {senarai.map((t, i) => (
            <li key={t.id} className="flex items-center gap-2 p-3 rounded-card border border-border bg-surface">
              <span className="text-xs font-semibold text-inkmuted w-5 shrink-0">{i + 1}.</span>

              {idEdit === t.id ? (
                <>
                  <input
                    type="text"
                    value={teksEdit}
                    onChange={(e) => setTeksEdit(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2 rounded-card border border-border bg-surface text-sm"
                    autoFocus
                  />
                  <button onClick={() => simpanEdit(t.id)} aria-label="Simpan" className="p-1.5 rounded-card hover:bg-base text-green-700 shrink-0">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIdEdit(null)} aria-label="Batal" className="p-1.5 rounded-card hover:bg-base text-inkmuted shrink-0">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-ink">{t.perkara}</span>
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => pindah(i, -1)} disabled={i === 0} aria-label="Naik" className="p-1.5 rounded-card hover:bg-base text-inkmuted disabled:opacity-30">
                        <ChevronUp size={15} />
                      </button>
                      <button onClick={() => pindah(i, 1)} disabled={i === senarai.length - 1} aria-label="Turun" className="p-1.5 rounded-card hover:bg-base text-inkmuted disabled:opacity-30">
                        <ChevronDown size={15} />
                      </button>
                      <button onClick={() => mulaEdit(t)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => padam(t.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
