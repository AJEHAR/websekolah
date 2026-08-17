import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useKumpulanBertugas, tambahKumpulan, kemaskiniKumpulan, padamKumpulan } from '../../hooks/useKumpulanBertugas.js'
import { useOutletContext } from 'react-router-dom'
import KumpulanBertugasCard from './KumpulanBertugasCard.jsx'
import KumpulanBertugasModal from './KumpulanBertugasModal.jsx'
import TugasBertugasSenarai from './TugasBertugasSenarai.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

export default function Kumpulan() {
  const { konfirm } = useDialog()
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')
  const { senarai, loading, muatSemula } = useKumpulanBertugas()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [kumpulanEdit, setKumpulanEdit] = useState(null)

  async function simpan(data) {
    if (kumpulanEdit) await kemaskiniKumpulan(kumpulanEdit.id, data)
    else await tambahKumpulan(data)
    setTunjukBorang(false)
    setKumpulanEdit(null)
    muatSemula()
  }

  function edit(kumpulan) {
    setKumpulanEdit(kumpulan)
    setTunjukBorang(true)
  }

  async function padam(id) {
    if (!(await konfirm('Padam kumpulan ini?', { bahaya: true }))) return
    await padamKumpulan(id)
    muatSemula()
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-ink shrink-0">Kumpulan ({senarai.length})</h2>
          {adaSeksyen('guru-bertugas') && (
            <button
              onClick={() => { setKumpulanEdit(null); setTunjukBorang(true) }}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-red px-3 py-2 rounded-card shrink-0"
            >
              <Plus size={14} /> Tambah Kumpulan
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : senarai.length === 0 ? (
          <p className="text-sm text-inkmuted">Tiada kumpulan lagi.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {senarai.map((k) => (
              <KumpulanBertugasCard key={k.id} kumpulan={k} isAdmin={adaSeksyen('guru-bertugas')} onEdit={edit} onPadam={padam} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink mb-4">Tugas</h2>
        <TugasBertugasSenarai isAdmin={adaSeksyen('guru-bertugas')} />
      </section>

      <KumpulanBertugasModal
        open={tunjukBorang}
        onClose={() => { setTunjukBorang(false); setKumpulanEdit(null) }}
        kumpulan={kumpulanEdit}
        profiles={profilesAktif}
        onSimpan={simpan}
      />
    </div>
  )
}
