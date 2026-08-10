import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { simpanProfileAdmin, padamProfileAdmin } from '../../hooks/useAdminProfiles.js'
import AdminProfileForm from './AdminProfileForm.jsx'
import SenaraiStaff from './SenaraiStaff.jsx'

export default function Admin() {
  const { user, loading: loadingAuth, signInWithGoogle } = useAuth()
  const { isAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const { profiles, loading: loadingProfiles, muatSemula } = useProfilesList()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [profileEdit, setProfileEdit] = useState(null)

  if (loadingAuth || (user && loadingAdmin)) {
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center text-sm text-inkmuted">
        Memuatkan…
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Panel Admin</h1>
          <p className="text-inkmuted mt-2 text-sm">Sila log masuk dengan Google untuk akses halaman ini.</p>
          <button
            onClick={signInWithGoogle}
            className="mt-6 h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold"
          >
            Log Masuk dengan Google
          </button>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Akses Terhad</h1>
          <p className="text-inkmuted mt-2 text-sm">Halaman ini khas untuk admin sahaja.</p>
        </div>
      </main>
    )
  }

  async function simpan(emel, data) {
    await simpanProfileAdmin(emel, data, user.uid)
    setTunjukBorang(false)
    setProfileEdit(null)
    muatSemula()
  }

  function edit(profile) {
    setProfileEdit(profile)
    setTunjukBorang(true)
  }

  async function padam(emel) {
    if (!window.confirm('Padam profile staff ini? Tindakan ini tidak boleh dibatalkan.')) return
    await padamProfileAdmin(emel)
    muatSemula()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-16 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink">Panel Admin</h1>
        <p className="text-inkmuted mt-1 text-sm">Urus profile staff sekolah.</p>
      </div>

      <section className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-8">
        {!tunjukBorang ? (
          <button
            onClick={() => { setProfileEdit(null); setTunjukBorang(true) }}
            className="flex items-center gap-2 text-sm font-semibold text-brand-red"
          >
            <Plus size={18} /> Tambah Staff Baru
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-ink">
                {profileEdit ? 'Kemas Kini Staff' : 'Tambah Staff Baru'}
              </h2>
              <button
                onClick={() => { setTunjukBorang(false); setProfileEdit(null) }}
                aria-label="Tutup borang"
                className="p-1.5 rounded-card hover:bg-base text-inkmuted"
              >
                <X size={18} />
              </button>
            </div>
            <AdminProfileForm
              profile={profileEdit}
              onSimpan={simpan}
              onBatal={() => { setTunjukBorang(false); setProfileEdit(null) }}
            />
          </>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-ink mb-4">Senarai Staff ({profiles.length})</h2>
        <SenaraiStaff profiles={profiles} loading={loadingProfiles} onEdit={edit} onPadam={padam} />
      </section>
    </main>
  )
}
