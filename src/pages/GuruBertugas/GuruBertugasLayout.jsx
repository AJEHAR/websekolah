import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'
import AksesPrompt from '../../components/AksesPrompt.jsx'
import { useTetapanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'

const TAJUK_SUBPAGE = {
  '/guru-bertugas/kumpulan': 'Kumpulan',
  '/guru-bertugas/3k': 'Laporan 3K',
  '/guru-bertugas/banci': 'Laporan Banci',
  '/guru-bertugas/harian': 'Laporan Harian',
  '/guru-bertugas/perhimpunan': 'Laporan Perhimpunan',
}

export default function GuruBertugasLayout() {
  const { user } = useAuth()
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()
  const location = useLocation()
  const adalahHub = location.pathname === '/guru-bertugas'

  if (!user) {
    return <AksesPrompt namaHalaman="Guru Bertugas" pendaftaranDibuka={pendaftaranDibuka} />
  }

  return (
    <AksesGate user={user}>
      {adalahHub ? (
        <Outlet context={{ user }} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-10">
          <Link to="/guru-bertugas" className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
            <ChevronLeft size={14} /> Home Guru Bertugas
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Guru Bertugas</h1>
          <p className="text-xs text-inkmuted mt-1 mb-5">
            {TAJUK_SUBPAGE[location.pathname] ?? ''}
          </p>
          <Outlet context={{ user }} />
        </div>
      )}
    </AksesGate>
  )
}
