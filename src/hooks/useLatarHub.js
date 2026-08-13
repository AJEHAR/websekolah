import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'latarHub'

// Untuk satu Hub (dipanggil dalam setiap KeberadaanHub.jsx, GuruBertugasHub.jsx, dll)
export function useLatarHub(seksyen) {
  const [latar, setLatar] = useState(null)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !seksyen) {
      setLatar(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, seksyen))
      setLatar(snap.exists() ? snap.data() : null)
    } finally {
      setLoading(false)
    }
  }, [seksyen])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { latar, loading, muatSemula }
}

// Untuk page admin - semua seksyen sekali gus
export function useLatarHubSemua() {
  const [semua, setSemua] = useState({})
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setSemua({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, KOLEKSI))
      const peta = {}
      snap.docs.forEach((d) => {
        peta[d.id] = d.data()
      })
      setSemua(peta)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { semua, loading, muatSemula }
}

export async function simpanLatarHub(seksyen, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, seksyen), { ...data, updatedAt: serverTimestamp(), updatedBy: uid }, { merge: true })
}
