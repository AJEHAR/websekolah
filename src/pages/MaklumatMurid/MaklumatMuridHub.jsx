import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { MAKLUMAT_MURID_AKSES_PANTAS } from './maklumatMuridAksesPantas.js'

export default function MaklumatMuridHub() {
  const { latar } = useLatarHub('maklumat-murid')
  return (
    <HubHero
      title="Maklumat Murid"
      subtitle="Data, analisis & pendaftaran murid"
      gradient="linear-gradient(160deg, #16240B 0%, #27500A 55%, #639922 130%)"
      aksesTeks="#27500A"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={MAKLUMAT_MURID_AKSES_PANTAS}
    />
  )
}
