import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { KURIKULUM_AKSES_PANTAS } from './kurikulumAksesPantas.js'

export default function KurikulumHub() {
  const { latar } = useLatarHub('kurikulum')
  return (
    <HubHero
      title="Kurikulum"
      subtitle="Borang PLC, RPI & RPT"
      gradient="linear-gradient(160deg, #052E2B 0%, #0B6E64 55%, #2DD4BF 130%)"
      aksesTeks="#0B6E64"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={KURIKULUM_AKSES_PANTAS}
    />
  )
}
