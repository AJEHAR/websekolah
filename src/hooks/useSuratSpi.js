import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'suratSpi'

// Satu koleksi Firestore DIKONGSI (schema), tapi diASINGKAN datanya ikut
// medan "seksyen" ('kurikulum' | 'hem') - setiap page (KURI/HEM) cuma
// tapis & papar dokumen seksyen dia sendiri sahaja. TIDAK berkongsi
// senarai - dokumen ditambah di KURI takkan muncul di HEM & sebaliknya.
export function useSuratSpi(seksyen) {
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
      // Terkini dulu (dokumen ditambah baru-baru ni senang dijumpai atas).
      semua.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
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

export async function tambahSuratSpi(seksyen, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { ...data, seksyen, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function kemaskiniSuratSpi(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamSuratSpi(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
