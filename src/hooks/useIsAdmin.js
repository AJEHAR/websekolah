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
  // Emel yang data 'peranan' di atas sepadan dengannya. Guna ni (bukan
  // hanya 'loading') untuk elak race condition: lepas refresh/login, ada
  // SATU render di mana `user` dah bertukar tapi effect di bawah belum
  // sempat jalan - `loading` state lama (dari pusingan sebelum ni, cth:
  // semasa user masih null) boleh jadi `false` walaupun data belum sepadan
  // dengan user SEMASA. Kalau tak dikawal, App.jsx (PenggeraPaksaProfil)
  // baca status salah ('bukan admin') seketika dan redirect (replace) ke
  // /profil - URL browser tertukar kekal walaupun data betul sampai sesaat
  // kemudian. Dengan track emel yang data ni sepadan, "loading" kekal true
  // sehingga data untuk user SEMASA benar-benar sampai.
  const [emelDimuatkan, setEmelDimuatkan] = useState(undefined)

  useEffect(() => {
    let batal = false
    async function semak() {
      if (!isFirebaseConfigured || !user?.email) {
        setPeranan([])
        setEmelDimuatkan(user?.email ?? null)
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
          setEmelDimuatkan(user.email)
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
  const sedangDimuatkan = loading || emelDimuatkan !== (user?.email ?? null)

  return { isAdmin, isSuperAdmin, peranan: senaraiPeranan, adaSeksyen, loading: sedangDimuatkan }
}
