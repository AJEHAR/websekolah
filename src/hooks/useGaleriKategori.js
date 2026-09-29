import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Kategori Album Galeri (cth. "Sekolah", "Aktiviti") - admin boleh
// tambah/padam kategori sendiri (bukan senarai tetap dlm kod), spy fleksibel
// bila perlu kategori baru (Sukan, Lawatan, dll) tanpa ubah kod.
const KOLEKSI = 'galeriKategori'

export function useGaleriKategori() {
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
      semua.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
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

export async function tambahKategoriGaleri(nama, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    nama: nama.trim(), createdAt: serverTimestamp(), createdBy: uid,
  })
  return ref.id
}

export async function padamKategoriGaleri(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Cari kategori ikut nama (case-insensitive) - guna utk migrasi (cipta
// kategori "Sekolah" hanya jika belum wujud, elak duplicate).
export function cariKategoriIkutNama(senarai, nama) {
  return senarai.find((k) => k.nama.trim().toLowerCase() === nama.trim().toLowerCase())
}
