import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'

const TABS = [
  { label: 'Hari Ini', to: '/keberadaan/hari-ini' },
  { label: 'Esok', to: '/keberadaan/esok' },
  { label: 'Log', to: '/keberadaan/log' },
]

export default function KeberadaanLayout() {
  const { user, signInWithGoogle } = useAuth()

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Keberadaan</h1>
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
        <h1 className="text-xl sm:text-2xl font-bold text-ink mb-4">Keberadaan</h1>

        <div className="flex gap-2 mb-5">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="px-4 py-2 rounded-full text-xs font-medium border border-border text-inkmuted"
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' } : undefined
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <Outlet context={{ user }} />
      </div>
    </AksesGate>
  )
}
