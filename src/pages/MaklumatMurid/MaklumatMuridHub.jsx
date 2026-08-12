import HubHero from '../../components/HubHero.jsx'
import { MAKLUMAT_MURID_AKSES_PANTAS } from './maklumatMuridAksesPantas.js'

export default function MaklumatMuridHub() {
  return (
    <HubHero
      title="Maklumat Murid"
      subtitle="Data, analisis & pendaftaran murid"
      gradient="linear-gradient(160deg, #16240B 0%, #27500A 55%, #639922 130%)"
      aksesTeks="#27500A"
      aksesPantas={MAKLUMAT_MURID_AKSES_PANTAS}
    />
  )
}
