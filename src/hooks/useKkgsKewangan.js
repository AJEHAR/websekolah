import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsKewangan'

// Buku Tunai KKGS - senarai transaksi (Masuk/Keluar), susun ikut tarikh.
// SEMUA staff boleh BACA (telus), cuma Jawatankuasa boleh TULIS (lihat
// firestore.rules).
export function useKkgsKewanganSenarai() {
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
      const q = query(collection(db, KOLEKSI), orderBy('tarikh', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahKewanganKkgs({ tarikh, perkara, jenis, jumlah, catatan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    tarikh, perkara: perkara.trim(), jenis, jumlah: Number(jumlah), catatan: catatan?.trim() ?? '',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

export async function kemaskiniKewanganKkgs(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamKewanganKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
