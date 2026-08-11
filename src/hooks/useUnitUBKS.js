import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'unitUBKS'

export function useUnitUBKSTahun(tahunSesi) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahunSesi) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahunSesi', '==', String(tahunSesi)))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [tahunSesi])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahUnit(tahunSesi, namaUnit, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    tahunSesi: String(tahunSesi),
    namaUnit,
    gambarUnit: null,
    ahli: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}

export async function kemaskiniUnit(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamUnit(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
