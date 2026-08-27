import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kategoriUBKS'

// jenis: 'beruniform' | 'kelab' | 'sukan' | 'lain' - PILIHAN TETAP (bukan
// teka daripada teks "Nama Kategori" bebas yang admin taip). Sijil Tamat
// (autoIsiSijil/cariUnitUBKS di sijilTamatUtils.js) padan medan NI SAHAJA
// untuk isi Unit Beruniform/Kelab/Sukan - kalau kategori tiada jenis
// ditetapkan, auto-isi untuk kategori tu TAK akan berfungsi (staff kena
// taip manual sehingga admin tetapkan Jenis di Panel Admin > Kategori UBKS).
export const JENIS_KATEGORI = [
  { nilai: 'beruniform', label: 'Unit Beruniform' },
  { nilai: 'kelab', label: 'Kelab' },
  { nilai: 'sukan', label: 'Sukan' },
  { nilai: 'lain', label: 'Lain-lain (bukan 3 di atas)' },
]

export function useKategoriUBKS() {
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
      semua.sort((a, b) => (a.turutan ?? 0) - (b.turutan ?? 0))
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

export async function tambahKategori(nama, kod, turutan, jenis) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { nama, kod, turutan, jenis: jenis || null, createdAt: serverTimestamp() })
}

export async function kemaskiniKategori(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), data)
}

export async function padamKategori(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
