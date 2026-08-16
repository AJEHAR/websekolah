import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Emel yang 'profile' di atas sepadan dengannya - lihat nota panjang di
  // useIsAdmin.js. Tanpa ni, lepas refresh boleh ada SATU render di mana
  // `loading` state lama (false, dari pusingan sebelum user diketahui)
  // terpakai walaupun profile belum dimuat untuk user SEMASA - App.jsx
  // baca status jadi 'belum-profile' seketika dan redirect (replace) ke
  // /profil, walaupun staff tu dah lengkap profile & diluluskan.
  const [emelDimuatkan, setEmelDimuatkan] = useState(undefined)

  const emel = user?.email ?? null

  const muatSemula = useCallback(async () => {
    if (!emel || !isFirebaseConfigured) {
      setProfile(null)
      setEmelDimuatkan(emel)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const ref = doc(db, 'profiles', emelKeDocId(emel))
      const snap = await getDoc(ref)
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setError(null)
      setEmelDimuatkan(emel)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [emel])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  const sedangDimuatkan = loading || emelDimuatkan !== emel

  const simpanProfile = useCallback(
    async (data) => {
      if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
      if (!emel) throw new Error('Perlu log masuk dahulu')
      const ref = doc(db, 'profiles', emelKeDocId(emel))
      // Profile baru (self-register) -> status "menunggu" (perlu kelulusan admin).
      // Edit profile sedia ada -> status TAK diubah (kekal apa-apa nilai sebelum ni).
      const sediaAda = profile
        ? {}
        : { createdAt: serverTimestamp(), createdBy: user.uid, status: 'menunggu' }
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

  return { profile, loading: sedangDimuatkan, error, simpanProfile, muatSemula }
}
