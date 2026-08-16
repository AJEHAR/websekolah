import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProfile } from '../../hooks/useProfile.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useSekatan } from '../../hooks/useSekatan.js'
import { useTetapanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'
import ProfileForm from './ProfileForm.jsx'
import ProfileView from './ProfileView.jsx'

export default function Profile() {
  const { user, loading: loadingAuth, signInWithGoogle, signOutUser } = useAuth()
  const { profile, loading: loadingProfile, simpanProfile } = useProfile(user)
  const { isAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const { disekat, sebabSekatan, loading: loadingSekatan } = useSekatan(user)
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()
  const [modeEdit, setModeEdit] = useState(false)

  if (loadingAuth || (user && (loadingProfile || loadingAdmin || loadingSekatan))) {
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
          <p className="text-xs text-brand-red font-semibold mt-4">
            Sistem ini KHAS untuk staff SK Pendidikan Khas Kuantan sahaja.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => signInWithGoogle('login')}
              className="h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold"
            >
              Log Masuk (sudah ada akaun)
            </button>
            {pendaftaranDibuka && (
              <button
                onClick={() => signInWithGoogle('daftar')}
                className="h-12 px-6 rounded-card border border-border text-sm font-semibold text-ink"
              >
                Daftar (staff baru)
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // Akaun disekat kekal oleh admin - jangan papar borang pendaftaran
  // langsung (halang percubaan mohon semula berulang-ulang).
  if (disekat && !isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Akaun Disekat</h1>
          <p className="text-inkmuted mt-2 text-sm">
            Akaun ({user.email}) ini telah disekat daripada mendaftar dalam sistem ini.
            Sistem ini khas untuk staff SK Pendidikan Khas Kuantan sahaja.
          </p>
          {sebabSekatan && (
            <p className="text-inkmuted mt-2 text-xs italic">Sebab: {sebabSekatan}</p>
          )}
          <p className="text-inkmuted mt-4 text-xs">
            Kalau ini satu kesilapan, sila hubungi pentadbir sekolah.
          </p>
          <button
            onClick={signOutUser}
            className="mt-6 h-11 px-6 rounded-card border border-border text-sm font-medium text-ink"
          >
            Log Keluar
          </button>
        </div>
      </main>
    )
  }

  async function handleSimpan(data) {
    await simpanProfile(data)
    setModeEdit(false)
  }

  // Akaun admin (contoh: akaun rasmi/generik sekolah) tak dipaksa isi profile
  // peribadi (Nama/IC/dll) - ia pilihan sahaja, bukan wajib macam staff biasa.
  const akaunAdminTanpaProfile = isAdmin && !profile && !modeEdit

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-16">
      <div className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-10">
        {akaunAdminTanpaProfile ? (
          <div className="text-center py-6">
            <h1 className="text-lg font-bold text-ink">Akaun Admin</h1>
            <p className="text-inkmuted mt-2 text-sm">
              Akaun ni ada akses admin. Profile peribadi (Nama/IC/Jawatan) tak diperlukan
              untuk fungsi admin - hanya perlu kalau akaun ni juga mewakili seorang staff.
            </p>
            <button
              onClick={() => setModeEdit(true)}
              className="mt-5 text-sm font-semibold text-brand-red"
            >
              Isi profile juga (pilihan)
            </button>
          </div>
        ) : !profile || modeEdit ? (
          <>
            <h1 className="text-lg font-bold text-ink mb-5">
              {profile ? 'Kemas Kini Profile' : 'Lengkapkan Profile Anda'}
            </h1>
            <ProfileForm
              profile={profile}
              onSimpan={handleSimpan}
              onBatal={profile || isAdmin ? () => setModeEdit(false) : undefined}
            />
          </>
        ) : profile.status === 'menunggu' ? (
          <div className="text-center py-6">
            <h1 className="text-lg font-bold text-ink">Menunggu Kelulusan Admin</h1>
            <p className="text-inkmuted mt-2 text-sm">
              Profile anda ({profile.nama}) sudah dihantar dan sedang menunggu kelulusan admin.
            </p>
            <button
              onClick={() => setModeEdit(true)}
              className="mt-5 text-sm font-semibold text-brand-red"
            >
              Kemas kini maklumat
            </button>
          </div>
        ) : (
          <ProfileView profile={profile} onEdit={() => setModeEdit(true)} />
        )}
      </div>
    </main>
  )
}
