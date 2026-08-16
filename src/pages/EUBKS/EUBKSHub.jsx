import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { EUBKS_AKSES_PANTAS } from './eubksAksesPantas.js'

export default function EUBKSHub() {
  const { latar } = useLatarHub('eubks')
  return (
    <HubHero
      title="KOKU"
      subtitle="Unit Beruniform, Kelab dan Sukan"
      gradient="linear-gradient(160deg, #1A1A1A 0%, #4A0E16 55%, #C8102E 130%)"
      aksesTeks="#C8102E"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={EUBKS_AKSES_PANTAS}
    />
  )
}
