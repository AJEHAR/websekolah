import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import MenungguKelulusan from './MenungguKelulusan.jsx'

export default function MenungguPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <Isi />
}

function Isi() {
  const { profiles, loading, muatSemula } = useProfilesList()
  const bilangan = profiles.filter((p) => p.status === 'menunggu').length

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        {bilangan} permohonan menunggu · staff yang daftar sendiri, belum diluluskan
      </p>
      <MenungguKelulusan profiles={profiles} loading={loading} onSelesai={muatSemula} />
    </div>
  )
}
