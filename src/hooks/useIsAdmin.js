import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

export function useIsAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let batal = false
    async function semak() {
      if (!user?.email) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'admins', user.email))
        if (!batal) setIsAdmin(snap.exists())
      } finally {
        if (!batal) setLoading(false)
      }
    }
    semak()
    return () => { batal = true }
  }, [user])

  return { isAdmin, loading }
}
