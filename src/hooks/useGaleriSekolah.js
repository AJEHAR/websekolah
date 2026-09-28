import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Galeri Sekolah (gambar aktiviti/kemudahan) untuk halaman AWAM (Utama +
// /galeri). Koleksi BAHARU (senarai gambar, bukan satu dokumen tetapan) -
// baca sesiapa sahaja, tulis superadmin sahaja (lihat firestore.rules).
const KOLEKSI = 'galeriSekolah'

export function useGaleriSekolah() {
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
      // Terbaru dahulu - guna createdAt (Timestamp Firestore, boleh
      // dibandingkan terus dgn .seconds/.toMillis()) supaya gambar baru
      // ditambah muncul dulu dalam galeri/pratonton Utama.
      semua.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
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

export async function tambahGambarGaleri({ imageUrl, tajuk }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    imageUrl, tajuk: tajuk?.trim() ?? '', createdAt: serverTimestamp(), createdBy: uid,
  })
}

export async function padamGambarGaleri(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
