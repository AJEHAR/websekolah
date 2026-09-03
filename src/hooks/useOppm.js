import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oppm'

// OPPM ("One Page Project Manager") - untuk MANA-MANA projek/jawatankuasa
// sekolah (Panitia, Projek Mega, Pengurusan PIBG, dll - bukan Panitia
// sahaja). Satu koleksi dikongsi, tiada seksyen berasingan (letak bawah
// KURI sahaja, ikut keputusan pengguna).
export function useOppmSenarai() {
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
      semua.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0))
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

export async function muatkanOppm(id) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, KOLEKSI, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function tambahOppm(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  })
  return ref.id
}

export async function kemaskiniOppm(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamOppm(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
