import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kertasKerja'

export function useKertasKerja() {
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

// PENTING: rekod kertas kerja TAK snapshot gambar muka depan - simpan
// cuma `tahun`, gambar diambil LIVE (cari semula ikut tahun) setiap kali
// dipapar/dicetak. Sengaja begini (beza daripada Sijil Tamat yang snapshot)
// sebab niat sistem ni: reka bentuk muka depan tahun tu boleh dikemaskini
// admin/staff bila-bila, dan SEMUA kertas kerja tahun tu patut terus ikut
// reka bentuk terkini (bukan reka bentuk lama yang mungkin silap/usang).
export async function tambahKertasKerja(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function kemaskiniKertasKerja(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamKertasKerja(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
