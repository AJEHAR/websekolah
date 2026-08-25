import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, FileText, ExternalLink } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useKoleksiPekeliling, tambahPekeliling, kemaskiniPekeliling, padamPekeliling } from '../../hooks/useKoleksiPekeliling.js'
import KoleksiPekelilingModal from './KoleksiPekelilingModal.jsx'

export default function KoleksiPekeliling() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useKoleksiPekeliling()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)

  function bukaTambah() {
    setRekodEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function simpan(data) {
    if (rekodEdit) {
      await kemaskiniPekeliling(rekodEdit.id, data, user.uid)
    } else {
      await tambahPekeliling(data, user.uid)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam dokumen ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamPekeliling(id)
    muatSemula()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-inkmuted">{senarai.length} dokumen</p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
        >
          <Plus size={14} /> Tambah Dokumen
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada dokumen lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-4 rounded-card border border-border bg-surface">
              <div className="h-10 w-10 rounded-card bg-base flex items-center justify-center shrink-0 text-inkmuted">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{r.perkara}</p>
                {r.catatan && <p className="text-xs text-inkmuted mt-0.5">{r.catatan}</p>}
                {r.failUrl && (
                  <a
                    href={r.failUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-red mt-1.5"
                  >
                    Lihat Dokumen <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => bukaEdit(r)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={15} />
                </button>
                <button onClick={() => padam(r.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <KoleksiPekelilingModal
        open={tunjukBorang}
        rekod={rekodEdit}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        onSimpan={simpan}
      />
    </div>
  )
}
