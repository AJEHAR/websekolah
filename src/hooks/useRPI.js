import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'rpi'

export function useRPIList() {
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
      semua.sort((a, b) => (b.tahunSesi || '').localeCompare(a.tahunSesi || '') || (a.muridNama || '').localeCompare(b.muridNama || ''))
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

export async function tambahRPI(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
  return ref.id
}

export async function kemaskiniRPI(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamRPI(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
