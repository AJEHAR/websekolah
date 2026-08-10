import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProfile } from '../../hooks/useProfile.js'
import ProfileForm from './ProfileForm.jsx'
import ProfileView from './ProfileView.jsx'

export default function Profile() {
  const { user, loading: loadingAuth, signInWithGoogle } = useAuth()
  const { profile, loading: loadingProfile, simpanProfile } = useProfile(user)
  const [modeEdit, setModeEdit] = useState(false)

  if (loadingAuth || (user && loadingProfile)) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-sm text-inkmuted">
        Memuatkan…
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Profile</h1>
          <p className="text-inkmuted mt-2 text-sm">Sila log masuk dengan Google untuk lihat profile anda.</p>
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

  async function handleSimpan(data) {
    await simpanProfile(data)
    setModeEdit(false)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-16">
      <div className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-10">
        {!profile || modeEdit ? (
          <>
            <h1 className="text-lg font-bold text-ink mb-5">
              {profile ? 'Kemas Kini Profile' : 'Lengkapkan Profile Anda'}
            </h1>
            <ProfileForm
              profile={profile}
              onSimpan={handleSimpan}
              onBatal={profile ? () => setModeEdit(false) : undefined}
            />
          </>
        ) : (
          <ProfileView profile={profile} onEdit={() => setModeEdit(true)} />
        )}
      </div>
    </main>
  )
}
