import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useKumpulanBertugas, tambahKumpulan, kemaskiniKumpulan, padamKumpulan } from '../../hooks/useKumpulanBertugas.js'
import { useOutletContext } from 'react-router-dom'
import KumpulanBertugasCard from './KumpulanBertugasCard.jsx'
import KumpulanBertugasModal from './KumpulanBertugasModal.jsx'
import TugasBertugasSenarai from './TugasBertugasSenarai.jsx'

export default function Kumpulan() {
  const { user } = useOutletContext()
  const { isAdmin } = useIsAdmin(user)
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
    if (!window.confirm('Padam kumpulan ini?')) return
    await padamKumpulan(id)
    muatSemula()
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Kumpulan Guru Bertugas ({senarai.length})</h2>
          {isAdmin && (
            <button
              onClick={() => { setKumpulanEdit(null); setTunjukBorang(true) }}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-red"
            >
              <Plus size={16} /> Tambah Kumpulan
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
              <KumpulanBertugasCard key={k.id} kumpulan={k} isAdmin={isAdmin} onEdit={edit} onPadam={padam} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink mb-4">Tugas Guru Bertugas</h2>
        <TugasBertugasSenarai isAdmin={isAdmin} />
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
