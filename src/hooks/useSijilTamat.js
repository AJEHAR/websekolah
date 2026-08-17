import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'sijilTamat'

export function useSijilTamat() {
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
      semua.sort((a, b) => (a.bilangan ?? 0) - (b.bilangan ?? 0))
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

// PENTING: semua medan (No.KP, Nama, Kelas, dll) di-SNAPSHOT (disalin
// terus) ke dalam rekod sijil semasa cipta - BUKAN dikira semula secara
// langsung (live) dari koleksi murid/daftarMasukMurid/unitUBKS setiap kali
// dipaparkan. Sebab: sijil ialah DOKUMEN RASMI - kandungan dia patut kekal
// STABIL selepas dijana, tak boleh berubah senyap kalau data murid asal
// dikemaskini kemudian. Auto-isi cuma bantu MASA CIPTA (jimat taip), lepas
// tu staff boleh edit terus, dan nilai yang disimpan itulah yang muktamad.
export async function tambahSijilTamat(data, bilanganSeterusnya, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    ...data,
    bilangan: bilanganSeterusnya,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}

export async function kemaskiniSijilTamat(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamSijilTamat(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Import pukal (CSV data lama) - guna Bilangan TERUS daripada CSV (kekal
// nombor asal), sama corak dengan importPukalDaftarMasuk.
export async function importPukalSijilTamat(baris, uid, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const SAIZ_KELOMPOK = 400
  let selesai = 0
  for (let i = 0; i < baris.length; i += SAIZ_KELOMPOK) {
    const kumpulan = baris.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((b) => {
      const ref = doc(collection(db, KOLEKSI))
      batch.set(ref, {
        ...b.data,
        bilangan: b.data.bilangan ? Number(b.data.bilangan) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: uid,
      })
    })
    await batch.commit()
    selesai += kumpulan.length
    onProgress?.(selesai, baris.length)
  }
  return { bilangan: baris.length }
}
