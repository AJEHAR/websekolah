import HubHero from '../../components/HubHero.jsx'
import { ADMIN_AKSES_PANTAS } from './adminAksesPantas.js'

export default function AdminHub() {
  return (
    <HubHero
      title="Panel Admin"
      subtitle="Urus staff, kategori & tetapan sistem"
      gradient="linear-gradient(160deg, #0F0F0E 0%, #3A3A38 55%, #5F5E5A 130%)"
      aksesTeks="#3A3A38"
      aksesPantas={ADMIN_AKSES_PANTAS}
    />
  )
}
