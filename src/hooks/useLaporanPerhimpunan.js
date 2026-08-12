import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'laporanPerhimpunan'

export function useLaporanPerhimpunan() {
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
      semua.sort((a, b) => (b.tarikh || '').localeCompare(a.tarikh || '')) // terkini dulu
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

export async function tambahLaporanPerhimpunan(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}

export async function kemaskiniLaporanPerhimpunan(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamLaporanPerhimpunan(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
