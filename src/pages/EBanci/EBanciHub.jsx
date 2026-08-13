import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { EBANCI_AKSES_PANTAS } from './ebanciAksesPantas.js'

export default function EBanciHub() {
  const { latar } = useLatarHub('ebanci')
  return (
    <HubHero
      title="eBanci"
      subtitle="Kehadiran murid & Papan RMT"
      gradient="linear-gradient(160deg, #241704 0%, #633806 55%, #F2C230 130%)"
      aksesTeks="#633806"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={EBANCI_AKSES_PANTAS}
    />
  )
}
