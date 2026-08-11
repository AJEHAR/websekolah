import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// peranan: null = belum semak, [] = bukan admin, ['super'] = admin penuh,
// ['ubks'] / ['murid'] / ['guru-bertugas'] = admin seksyen tertentu sahaja.
// Rekod admin lama (sebelum ciri peranan ni wujud, tiada medan 'peranan')
// dianggap ['super'] secara automatik (elak "downgrade" admin sedia ada).
export function useIsAdmin(user) {
  const [peranan, setPeranan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let batal = false
    async function semak() {
      if (!isFirebaseConfigured || !user?.email) {
        setPeranan([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'admins', user.email))
        if (!batal) {
          if (snap.exists()) {
            const data = snap.data()
            setPeranan(Array.isArray(data.peranan) && data.peranan.length > 0 ? data.peranan : ['super'])
          } else {
            setPeranan([])
          }
        }
      } finally {
        if (!batal) setLoading(false)
      }
    }
    semak()
    return () => { batal = true }
  }, [user])

  const senaraiPeranan = peranan ?? []
  const isSuperAdmin = senaraiPeranan.includes('super')
  const isAdmin = senaraiPeranan.length > 0 // sebarang jenis admin (super ATAU seksyen)
  const adaSeksyen = (seksyen) => isSuperAdmin || senaraiPeranan.includes(seksyen)

  return { isAdmin, isSuperAdmin, peranan: senaraiPeranan, adaSeksyen, loading }
}
