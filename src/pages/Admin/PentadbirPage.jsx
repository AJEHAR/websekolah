import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import UrusAdmin from './UrusAdmin.jsx'

export default function PentadbirPage() {
  const { user } = useOutletContext()
  const { profiles } = useProfilesList()
  const staffAktif = profiles.filter((p) => p.status !== 'menunggu')

  return <UrusAdmin profiles={staffAktif} currentUser={user} />
}
