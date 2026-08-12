import HubHero from '../../components/HubHero.jsx'
import { EBANCI_AKSES_PANTAS } from './ebanciAksesPantas.js'

export default function EBanciHub() {
  return (
    <HubHero
      title="eBanci"
      subtitle="Kehadiran murid & Papan RMT"
      gradient="linear-gradient(160deg, #241704 0%, #633806 55%, #F2C230 130%)"
      aksesTeks="#633806"
      aksesPantas={EBANCI_AKSES_PANTAS}
    />
  )
}
