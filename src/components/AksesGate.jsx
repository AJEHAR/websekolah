import { Link } from 'react-router-dom'
import { useAksesStatus } from '../hooks/useAksesStatus.js'

export default function AksesGate({ user, children }) {
  const { status, loading } = useAksesStatus(user)

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-sm text-inkmuted">Memuatkan…</p>
  }

  if (status === 'belum-profile') {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Lengkapkan Profile Dahulu</h1>
          <p className="text-inkmuted mt-2 text-sm">
            Sila lengkapkan profile anda sebelum akses halaman ini.
          </p>
          <Link
            to="/profil"
            className="inline-block mt-6 h-12 leading-[48px] px-6 rounded-card bg-brand-red text-white text-sm font-semibold"
          >
            Pergi ke Profile
          </Link>
        </div>
      </main>
    )
  }

  if (status === 'menunggu') {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Menunggu Kelulusan Admin</h1>
          <p className="text-inkmuted mt-2 text-sm">
            Profile anda sudah dihantar dan sedang menunggu kelulusan admin. Sila cuba lagi kemudian.
          </p>
        </div>
      </main>
    )
  }

  return children
}
