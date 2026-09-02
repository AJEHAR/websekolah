import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprUnit'

// Tag "Unit" dalam laporan OPR - BERASINGAN ikut seksyen (sama sebab
// dengan useLaporanOPR.js - setiap bahagian ada konsep "Unit" tersendiri,
// tak sepadan/berkaitan antara KURI/HEM/KOKU).
export function useOprUnit(seksyen) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !seksyen) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('seksyen', '==', seksyen))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [seksyen])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahOprUnit(seksyen, namaUnit, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { namaUnit, seksyen, createdAt: serverTimestamp(), updatedBy: uid })
}

export async function padamOprUnit(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
