import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { KKGS_AKSES_PANTAS } from './kkgsAksesPantas.js'

export default function KKGSHub() {
  const { latar } = useLatarHub('kkgs')
  return (
    <HubHero
      title="KKGS"
      subtitle="Kelab Kebajikan Guru & Staf"
      gradient="linear-gradient(160deg, #1A1A1A 0%, #0F6E56 55%, #4FD1A5 130%)"
      aksesTeks="#0F6E56"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={KKGS_AKSES_PANTAS}
    />
  )
}
