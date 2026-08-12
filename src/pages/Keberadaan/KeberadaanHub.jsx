import HubHero from '../../components/HubHero.jsx'
import { KEBERADAAN_AKSES_PANTAS } from './keberadaanAksesPantas.js'

export default function KeberadaanHub() {
  return (
    <HubHero
      title="Keberadaan"
      subtitle="Rekod kehadiran & pergerakan staff"
      gradient="linear-gradient(160deg, #0A2038 0%, #0C447C 55%, #378ADD 130%)"
      aksesTeks="#0C447C"
      aksesPantas={KEBERADAAN_AKSES_PANTAS}
    />
  )
}
