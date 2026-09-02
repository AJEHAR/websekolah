import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'
import AksesPrompt from '../../components/AksesPrompt.jsx'
import { useTetapanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'

const TAJUK_SUBPAGE = {
  '/maklumat-murid/analisis': 'Analisis',
  '/maklumat-murid/semakan': 'Semakan Murid',
  '/maklumat-murid/daftar-masuk': 'Daftar Masuk Murid',
  '/maklumat-murid/daftar-keluar': 'Daftar Keluar Murid',
  '/maklumat-murid/kehadiran-murid': 'Kehadiran Murid',
  '/maklumat-murid/kehadiran-rmt': 'Kehadiran RMT',
  '/maklumat-murid/surat-spi': 'Surat/SPI',
  '/maklumat-murid/opr': 'OPR',
}

export default function MaklumatMuridLayout() {
  const { user } = useAuth()
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()
  const location = useLocation()
  const adalahHub = location.pathname === '/maklumat-murid'

  if (!user) {
    return <AksesPrompt namaHalaman="HEM" pendaftaranDibuka={pendaftaranDibuka} />
  }

  return (
    <AksesGate user={user}>
      {adalahHub ? (
        <Outlet context={{ user }} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-10">
          <Link to="/maklumat-murid" className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
            <ChevronLeft size={14} /> Home HEM
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">HEM</h1>
          <p className="text-xs text-inkmuted mt-1 mb-5">
            {TAJUK_SUBPAGE[location.pathname] ?? ''}
          </p>
          <Outlet context={{ user }} />
        </div>
      )}
    </AksesGate>
  )
}
