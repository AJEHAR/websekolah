import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AksesGate from '../../components/AksesGate.jsx'
import AksesPrompt from '../../components/AksesPrompt.jsx'
import { useTetapanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'

const TAJUK_SUBPAGE = {
  '/kkgs/senarai-ahli': 'Senarai Ahli',
  '/kkgs/jawatankuasa': 'Jawatankuasa',
  '/kkgs/pilihan-raya': 'Pilihan Raya',
  '/kkgs/program': 'Program/Aktiviti',
  '/kkgs/yuran': 'Yuran Sumbangan',
  '/kkgs/kewangan': 'Kewangan',
  '/kkgs/claim': 'Claim KKGS',
}

// Page "Paparan" (disambung ke TV/projektor) SENGAJA tak dapat chrome
// biasa (link "Kembali", tajuk, padding max-w-6xl) - ia perlu full-bleed
// gelap untuk dibaca dari jauh dalam dewan, bukan borang/senarai biasa.
const LALUAN_PAPARAN_PENUH = ['/kkgs/pilihan-raya/paparan']

export default function KKGSLayout() {
  const { user } = useAuth()
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()
  const location = useLocation()
  const adalahHub = location.pathname === '/kkgs'
  const adalahPaparanPenuh = LALUAN_PAPARAN_PENUH.includes(location.pathname)

  if (!user) {
    return <AksesPrompt namaHalaman="KKGS" pendaftaranDibuka={pendaftaranDibuka} />
  }

  return (
    <AksesGate user={user}>
      {adalahHub || adalahPaparanPenuh ? (
        <Outlet context={{ user }} />
      ) : (
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-6 lg:py-10">
          <Link to="/kkgs" className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
            <ChevronLeft size={14} /> Kembali ke KKGS
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">KKGS</h1>
          <p className="text-xs text-inkmuted mt-1 mb-5">
            {TAJUK_SUBPAGE[location.pathname] ?? ''}
          </p>
          <Outlet context={{ user }} />
        </div>
      )}
    </AksesGate>
  )
}
