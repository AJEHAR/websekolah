import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

// Semak sama ada EMEL PENGGUNA SEMASA disekat kekal daripada mendaftar.
// Guna corak sama macam useProfile.js/useIsAdmin.js (track emel yang data
// disemak ni sepadan dengannya) - elak race condition lepas refresh/login
// (rujuk nota panjang dalam useIsAdmin.js untuk sebab penuh).
export function useSekatan(user) {
  const [disekat, setDisekat] = useState(false)
  const [sebabSekatan, setSebabSekatan] = useState('')
  const [loading, setLoading] = useState(true)
  const [emelDimuatkan, setEmelDimuatkan] = useState(undefined)

  const emel = user?.email ?? null

  useEffect(() => {
    let batal = false
    async function semak() {
      if (!emel || !isFirebaseConfigured) {
        if (!batal) {
          setDisekat(false)
          setSebabSekatan('')
          setEmelDimuatkan(emel)
          setLoading(false)
        }
        return
      }
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'emelDisekat', emelKeDocId(emel)))
        if (!batal) {
          setDisekat(snap.exists())
          setSebabSekatan(snap.exists() ? (snap.data().sebab ?? '') : '')
          setEmelDimuatkan(emel)
        }
      } finally {
        if (!batal) setLoading(false)
      }
    }
    semak()
    return () => { batal = true }
  }, [emel])

  const sedangDimuatkan = loading || emelDimuatkan !== emel
  return { disekat, sebabSekatan, loading: sedangDimuatkan }
}
