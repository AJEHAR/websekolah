import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprLatarBelakang'

// Latar belakang cetakan OPR - BERASINGAN ikut seksyen (setiap bahagian
// boleh ada tema/latar sendiri untuk OPR dia, tak dikongsi).
export function useOprLatarBelakang(seksyen) {
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
      semua.sort((a, b) => (a.namaTema ?? '').localeCompare(b.namaTema ?? ''))
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

export async function tambahOprLatarBelakang(seksyen, namaTema, gambarUrl, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { namaTema, gambarUrl, seksyen, createdAt: serverTimestamp(), updatedBy: uid })
}

export async function padamOprLatarBelakang(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
