import { useProfilesList } from '../../hooks/useProfilesList.js'
import MenungguKelulusan from './MenungguKelulusan.jsx'

export default function MenungguPage() {
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
