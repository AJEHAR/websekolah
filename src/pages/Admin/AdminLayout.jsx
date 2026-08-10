import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

const TAJUK_SUBPAGE = {
  '/admin/staff': 'Staff',
  '/admin/menunggu': 'Menunggu Kelulusan',
  '/admin/pentadbir': 'Pentadbir',
  '/admin/blok3k': 'Blok 3K',
}

export default function AdminLayout() {
  const { user, loading: loadingAuth, signInWithGoogle } = useAuth()
  const { isAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const location = useLocation()

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

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 lg:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-ink">Panel Admin</h1>
      <p className="text-xs text-inkmuted mt-1 mb-5">
        {TAJUK_SUBPAGE[location.pathname] ?? ''}
      </p>

      <Outlet context={{ user }} />
    </div>
  )
}
