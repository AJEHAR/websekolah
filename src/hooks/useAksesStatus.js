import { useProfile } from './useProfile.js'
import { useIsAdmin } from './useIsAdmin.js'

// Pulangkan salah satu: 'memuatkan' | 'admin' | 'diluluskan' | 'menunggu' | 'belum-profile'
export function useAksesStatus(user) {
  const { profile, loading: loadingProfile } = useProfile(user)
  const { isAdmin, loading: loadingAdmin } = useIsAdmin(user)
  const loading = loadingProfile || loadingAdmin

  let status = 'memuatkan'
  if (!loading) {
    if (isAdmin) status = 'admin'
    else if (!profile) status = 'belum-profile'
    else if (profile.status === 'menunggu') status = 'menunggu'
    else status = 'diluluskan' // termasuk profile lama tanpa field status (anggap diluluskan)
  }

  return { status, profile, isAdmin, loading }
}
