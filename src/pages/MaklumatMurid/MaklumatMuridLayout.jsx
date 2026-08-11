import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'

const TAJUK_SUBPAGE = {
  '/maklumat-murid/analisis': 'Analisis',
  '/maklumat-murid/semakan': 'Semakan Murid',
  '/maklumat-murid/daftar-masuk': 'Daftar Masuk Murid',
  '/maklumat-murid/daftar-keluar': 'Daftar Keluar Murid',
}

export default function MaklumatMuridLayout() {
  const { user, signInWithGoogle } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Maklumat Murid</h1>
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

  return (
    <AksesGate user={user}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 lg:py-10">
        <h1 className="text-xl sm:text-2xl font-bold text-ink">Maklumat Murid</h1>
        <p className="text-xs text-inkmuted mt-1 mb-5">
          {TAJUK_SUBPAGE[location.pathname] ?? ''}
        </p>

        <Outlet context={{ user }} />
      </div>
    </AksesGate>
  )
}
