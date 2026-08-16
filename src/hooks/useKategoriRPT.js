import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kategoriRPT'

export function useKategoriRPT() {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, KOLEKSI))
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.turutan ?? 0) - (b.turutan ?? 0))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahKategoriRPT(nama, turutan) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { nama, turutan, createdAt: serverTimestamp() })
}

export async function padamKategoriRPT(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
