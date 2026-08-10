import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKeberadaanSaya, kemaskiniKeberadaan, padamKeberadaan } from '../../hooks/useKeberadaan.js'
import { useState } from 'react'
import AksesGate from '../../components/AksesGate.jsx'
import KeberadaanCard from '../Keberadaan/KeberadaanCard.jsx'
import KeberadaanForm from '../Keberadaan/KeberadaanForm.jsx'
import { useProfilesList } from '../../hooks/useProfilesList.js'

export default function SenaraiKeberadaanSaya() {
  const { user } = useAuth()
  return (
    <AksesGate user={user}>
      <Isi user={user} />
    </AksesGate>
  )
}

function Isi({ user }) {
  const { isAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const { senarai, loading, muatSemula } = useKeberadaanSaya(user?.email)
  const [rekodEdit, setRekodEdit] = useState(null)

  async function simpanEdit(data) {
    await kemaskiniKeberadaan(rekodEdit.id, data)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!window.confirm('Padam rekod keberadaan ini?')) return
    await padamKeberadaan(id)
    muatSemula()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-16">
      <Link to="/profil" className="text-xs font-medium text-brand-red">&larr; Kembali ke Profile</Link>

      <div className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-8 mt-4">
        <h1 className="text-lg font-bold text-ink mb-1">Senarai Keberadaan Saya</h1>
        <p className="text-xs text-inkmuted mb-5">Semua rekod keberadaan yang anda hantar.</p>

        {rekodEdit ? (
          <KeberadaanForm
            profiles={profiles}
            rekod={rekodEdit}
            onSimpan={simpanEdit}
            onBatal={() => setRekodEdit(null)}
          />
        ) : loading ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : senarai.length === 0 ? (
          <p className="text-sm text-inkmuted">Tiada rekod keberadaan lagi.</p>
        ) : (
          <div className="space-y-2">
            {senarai.map((r) => (
              <KeberadaanCard
                key={r.id}
                rekod={r}
                bolehUrus={isAdmin || r.profilEmel === user.email}
                onEdit={setRekodEdit}
                onPadam={padam}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
