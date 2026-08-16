import { useProfile } from './useProfile.js'
import { useIsAdmin } from './useIsAdmin.js'
import { useSekatan } from './useSekatan.js'

// Pulangkan salah satu: 'memuatkan' | 'admin' | 'disekat' | 'diluluskan' | 'menunggu' | 'belum-profile'
// Admin disemak DULU - akaun admin tak terjejas sekatan/kelulusan profile
// staff (dua aliran berasingan).
export function useAksesStatus(user) {
  const { profile, loading: loadingProfile } = useProfile(user)
  const { isAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const { disekat, sebabSekatan, loading: loadingSekatan } = useSekatan(user)
  const loading = loadingProfile || loadingAdmin || loadingSekatan

  let status = 'memuatkan'
  if (!loading) {
    if (isAdmin) status = 'admin'
    else if (disekat) status = 'disekat'
    else if (!profile) status = 'belum-profile'
    else if (profile.status === 'menunggu') status = 'menunggu'
    else status = 'diluluskan' // termasuk profile lama tanpa field status (anggap diluluskan)
  }

  return { status, profile, isAdmin, disekat, sebabSekatan, loading }
}
