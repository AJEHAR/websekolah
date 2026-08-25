import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'laporanOPR'

export function useLaporanOPR() {
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
      semua.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
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

export async function dapatkanLaporanOPR(id) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, KOLEKSI, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function tambahLaporanOPR(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
  return ref.id
}

export async function kemaskiniLaporanOPR(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamLaporanOPR(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Import pukal (CSV data lama dari sistem OPR Google Sheets sebelum ni) -
// gambar/tandatangan KEKAL sebagai URL Google Drive sedia ada (tak perlu
// muat naik semula - fail asal kekal di Drive yang sama, cuma pautan
// disalin terus ke rekod Firestore baharu).
export async function importPukalLaporanOPR(baris, uid, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const SAIZ_KELOMPOK = 400
  let selesai = 0
  for (let i = 0; i < baris.length; i += SAIZ_KELOMPOK) {
    const kumpulan = baris.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((b) => {
      const ref = doc(collection(db, KOLEKSI))
      batch.set(ref, { ...b.data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid })
    })
    await batch.commit()
    selesai += kumpulan.length
    onProgress?.(selesai, baris.length)
  }
  return { bilangan: baris.length }
}
