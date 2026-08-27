import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'

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
  const { dijeda } = useAdminMode()
  // "Sebenar" (tak kira status jeda) - guna untuk logik ACCESS/ROUTING
  // sahaja (useAksesStatus.js) supaya admin tanpa profile staff (rujuk
  // AuthContext.jsx) tak tersalah "redirect isi profile" masa mod admin
  // dijeda. JANGAN guna versi ni untuk papar/sorok butang UI.
  const isSuperAdminSebenar = senaraiPeranan.includes('super')
  const isAdminSebenar = senaraiPeranan.length > 0
  // Versi "berkesan" (respect jeda) - guna ni untuk SEMUA papar/sorok
  // butang & panel admin di seluruh sistem (majoriti pemanggil useIsAdmin).
  const isSuperAdmin = isSuperAdminSebenar && !dijeda
  const isAdmin = isAdminSebenar && !dijeda
  const adaSeksyen = (seksyen) => !dijeda && (isSuperAdminSebenar || senaraiPeranan.includes(seksyen))
  const sedangDimuatkan = loading || emelDimuatkan !== (user?.email ?? null)

  return {
    isAdmin, isSuperAdmin, peranan: senaraiPeranan, adaSeksyen, loading: sedangDimuatkan,
    isAdminSebenar, isSuperAdminSebenar, dijeda,
  }
}
