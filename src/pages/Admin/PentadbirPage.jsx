import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import UrusAdmin from './UrusAdmin.jsx'

export default function PentadbirPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const staffAktif = profiles.filter((p) => p.status !== 'menunggu')

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <UrusAdmin profiles={staffAktif} currentUser={user} />
}
