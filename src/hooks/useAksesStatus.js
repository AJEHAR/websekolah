import { useProfile } from './useProfile.js'
import { useIsAdmin } from './useIsAdmin.js'
import { useSekatan } from './useSekatan.js'

// Pulangkan salah satu: 'memuatkan' | 'admin' | 'disekat' | 'diluluskan' | 'menunggu' | 'belum-profile'
// Admin disemak DULU - akaun admin tak terjejas sekatan/kelulusan profile
// staff (dua aliran berasingan).
//
// PENTING: status routing guna isAdminSebenar (BUKAN terjejas "Pause as
// Admin") - kalau tidak, admin yang tiada profile staff (dibenarkan,
// rujuk AuthContext.jsx) akan tersalah "redirect isi profile" bila dia
// jeda mod admin. isAdmin yang DIPULANGKAN (untuk Navbar papar/sorok
// pautan Admin) pula guna versi biasa (hormat jeda) - itu memang tujuan
// ciri ni: sorok akses admin dari UI semasa dijeda.
export function useAksesStatus(user) {
  const { profile, loading: loadingProfile } = useProfile(user)
  const { isAdmin, isAdminSebenar, loading: loadingAdmin } = useIsAdmin(user)
  const { disekat, sebabSekatan, loading: loadingSekatan } = useSekatan(user)
  const loading = loadingProfile || loadingAdmin || loadingSekatan

  let status = 'memuatkan'
  if (!loading) {
    if (isAdminSebenar) status = 'admin'
    else if (disekat) status = 'disekat'
    else if (!profile) status = 'belum-profile'
    else if (profile.status === 'menunggu') status = 'menunggu'
    else status = 'diluluskan' // termasuk profile lama tanpa field status (anggap diluluskan)
  }

  return { status, profile, isAdmin, disekat, sebabSekatan, loading }
}
