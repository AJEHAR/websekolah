import HubHero from '../../components/HubHero.jsx'
import { useLatarHub } from '../../hooks/useLatarHub.js'
import { GURU_BERTUGAS_AKSES_PANTAS } from './guruBertugasAksesPantas.js'

export default function GuruBertugasHub() {
  const { latar } = useLatarHub('guru-bertugas')
  return (
    <HubHero
      title="Guru Bertugas"
      subtitle="Kumpulan, Laporan 3K & Banci"
      gradient="linear-gradient(160deg, #1A1A1A 0%, #3C3489 55%, #7F77DD 130%)"
      aksesTeks="#3C3489"
      gambarTelefon={latar?.gambarTelefon}
      gambarDesktop={latar?.gambarDesktop}
      aksesPantas={GURU_BERTUGAS_AKSES_PANTAS}
    />
  )
}
