import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Plus, ClipboardList, Trash2 } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useOppmSenarai, padamOppm } from '../../hooks/useOppm.js'

// Senarai OPPM - untuk MANA-MANA projek/jawatankuasa sekolah (Panitia,
// Projek Mega, Pengurusan PIBG dll), bukan khusus Panitia sahaja.
export default function OPPM() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useOppmSenarai()
  const [carian, setCarian] = useState('')

  const disenarai = senarai.filter((o) => (o.namaProjek ?? '').toLowerCase().includes(carian.toLowerCase()))

  async function padam(e, id) {
    e.stopPropagation()
    if (!(await konfirm('Padam OPPM ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamOppm(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">One Page Project Manager - rancang & jejak sebarang projek/jawatankuasa sekolah (Panitia, Projek Mega, PIBG, dll) dalam satu muka surat.</p>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama projek…"
          className="flex-1 h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
        <button onClick={() => navigate('/kurikulum/oppm/baharu')} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold shrink-0">
          <Plus size={14} /> Projek Baharu
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada OPPM lagi.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((o) => {
            const bilTugasan = (o.tugasan ?? []).length
            const bilSiap = (o.tugasan ?? []).filter((t) => Object.values(t.statusBulan ?? {}).includes('siap')).length
            return (
              <button
                key={o.id}
                onClick={() => navigate(`/kurikulum/oppm/${o.id}`)}
                className="w-full text-left flex items-center gap-3 p-4 rounded-card border border-border bg-surface hover:border-brand-red transition-colors"
              >
                <div className="h-10 w-10 rounded-card bg-base flex items-center justify-center shrink-0 text-inkmuted">
                  <ClipboardList size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{o.namaProjek || 'Tanpa nama'}</p>
                  <p className="text-xs text-inkmuted">{o.tahunSesi} · Ketua: {o.ketua || '-'} · {bilTugasan} tugasan ({bilSiap} siap)</p>
                </div>
                <button onClick={(e) => padam(e, o.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red shrink-0">
                  <Trash2 size={15} />
                </button>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
