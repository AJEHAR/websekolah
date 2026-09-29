import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Gambar individu dalam Galeri Sekolah - setiap gambar kini milik SATU album
// (field albumId, rujuk galeriAlbum) - lihat useGaleriAlbum.js/useGaleriKategori.js
// utk struktur album/kategori. Koleksi ni sendiri tak berubah (senarai gambar
// rata), cuma tambah albumId - elak migrasi struktur besar-besaran.
const KOLEKSI = 'galeriSekolah'

// useGaleriSekolah() pulangkan SEMUA gambar (semua album) - dipakai utk
// migrasi (cari gambar tanpa albumId) & kira jumlah keseluruhan. Untuk papar
// gambar SATU album sahaja, tapis client-side ikut albumId (dataset galeri
// sekolah kecil, tak perlu query Firestore + index tambahan).
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

export function gambarIkutAlbum(senarai, albumId) {
  return senarai.filter((g) => g.albumId === albumId)
}

export async function tambahGambarGaleri({ imageUrl, tajuk, albumId }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    imageUrl, tajuk: tajuk?.trim() ?? '', albumId, createdAt: serverTimestamp(), createdBy: uid,
  })
}

// Tetapkan/pindah albumId gambar sedia ada - dipakai oleh migrasi automatik
// (lihat lib/migrasiGaleriAlbum.js) utk agihkan gambar lama (upload rata,
// sblm struktur album wujud) ke album "Umum".
export async function tetapkanAlbumGambar(id, albumId) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { albumId })
}

export async function padamGambarGaleri(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Padam SEMUA gambar dlm satu album sekali gus - dipanggil bila album itu
// sendiri dipadam (elak gambar "yatim" tanpa album tertinggal dlm Firestore).
export async function padamSemuaGambarAlbum(senarai, albumId) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const gambarAlbumIni = gambarIkutAlbum(senarai, albumId)
  await Promise.all(gambarAlbumIni.map((g) => deleteDoc(doc(db, KOLEKSI, g.id))))
}
