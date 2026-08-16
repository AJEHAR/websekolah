import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'

const TAJUK_SUBPAGE = {
  '/eubks/murid-ubks': 'Murid UBKS',
  '/eubks/kehadiran-ubks': 'Kehadiran UBKS',
  '/eubks/laporan-ubks': 'Laporan UBKS',
  '/eubks/perancangan-ubks': 'Perancangan UBKS',
}

export default function EUBKSLayout() {
  const { user, signInWithGoogle } = useAuth()
  const location = useLocation()
  const adalahHub = location.pathname === '/eubks'

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">eUBKS Ko</h1>
          <p className="text-inkmuted mt-2 text-sm">Sila log masuk dengan Google untuk akses halaman ini.</p>
          <button
            onClick={() => signInWithGoogle('login')}
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
      {adalahHub ? (
        <Outlet context={{ user }} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-10">
          <Link to="/eubks" className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
            <ChevronLeft size={14} /> Home UBKS
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">eUBKS Ko</h1>
          <p className="text-xs text-inkmuted mt-1 mb-5">
            {TAJUK_SUBPAGE[location.pathname] ?? ''}
          </p>
          <Outlet context={{ user }} />
        </div>
      )}
    </AksesGate>
  )
}
