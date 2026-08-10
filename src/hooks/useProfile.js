import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const emel = user?.email ?? null

  const muatSemula = useCallback(async () => {
    if (!emel || !isFirebaseConfigured) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const ref = doc(db, 'profiles', emelKeDocId(emel))
      const snap = await getDoc(ref)
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [emel])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  const simpanProfile = useCallback(
    async (data) => {
      if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
      if (!emel) throw new Error('Perlu log masuk dahulu')
      const ref = doc(db, 'profiles', emelKeDocId(emel))
      const sediaAda = profile ? {} : { createdAt: serverTimestamp(), createdBy: user.uid }
      await setDoc(
        ref,
        {
          ...data,
          emel,
          uid: user.uid,
          updatedAt: serverTimestamp(),
          ...sediaAda,
        },
        { merge: true }
      )
      await muatSemula()
    },
    [emel, profile, user, muatSemula]
  )

  return { profile, loading, error, simpanProfile, muatSemula }
}
