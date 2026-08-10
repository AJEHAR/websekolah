import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

export function useProfilesList() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setProfiles([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'profiles'))
      const senarai = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      senarai.sort((a, b) => (a.nama ?? '').localeCompare(b.nama ?? ''))
      setProfiles(senarai)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { profiles, loading, muatSemula }
}
