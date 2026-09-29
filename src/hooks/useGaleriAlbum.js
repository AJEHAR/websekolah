import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Album Galeri (cth. "Sambutan Hari Guru 2025") - setiap album ada tajuk,
// kategoriId (rujuk galeriKategori) dan gambar kulit. Gambar sebenar dlm
// album disimpan dlm koleksi galeriSekolah (field albumId rujuk album ni).
const KOLEKSI = 'galeriAlbum'

export function useGaleriAlbum() {
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

export async function tambahAlbumGaleri({ tajuk, kategoriId, gambarKulitUrl }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    tajuk: tajuk.trim(), kategoriId, gambarKulitUrl: gambarKulitUrl ?? '', createdAt: serverTimestamp(), createdBy: uid,
  })
  return ref.id
}

export async function kemaskiniAlbumGaleri(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), data)
}

export async function padamAlbumGaleri(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
