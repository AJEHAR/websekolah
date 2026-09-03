import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'
import AksesPrompt from '../../components/AksesPrompt.jsx'
import { useTetapanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'

const TAJUK_SUBPAGE = {
  '/kurikulum/borang-plc': 'Laporan PLC',
  '/kurikulum/rpi': 'RPI',
  '/kurikulum/rpt': 'RPT',
  '/kurikulum/template-kertas-kerja': 'Template Kertas Kerja',
  '/kurikulum/surat-spi': 'Surat/SPI',
  '/kurikulum/opr': 'OPR',
  '/kurikulum/oppm': 'OPPM',
}

function tajukSubpage(pathname) {
  if (pathname.startsWith('/kurikulum/oppm/')) return 'OPPM'
  return TAJUK_SUBPAGE[pathname] ?? ''
}

export default function KurikulumLayout() {
  const { user } = useAuth()
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()
  const location = useLocation()
  const adalahHub = location.pathname === '/kurikulum'

  if (!user) {
    return <AksesPrompt namaHalaman="KURI" pendaftaranDibuka={pendaftaranDibuka} />
  }

  return (
    <AksesGate user={user}>
      {adalahHub ? (
        <Outlet context={{ user }} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-10">
          <Link to="/kurikulum" className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
            <ChevronLeft size={14} /> Home KURI
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">KURI</h1>
          <p className="text-xs text-inkmuted mt-1 mb-5">
            {tajukSubpage(location.pathname)}
          </p>
          <Outlet context={{ user }} />
        </div>
      )}
    </AksesGate>
  )
}
