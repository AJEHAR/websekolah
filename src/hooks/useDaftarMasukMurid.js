import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'daftarMasukMurid'

export function useDaftarMasukMurid() {
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
      // Susun ikut bilangan (nombor turutan buku daftar) menaik - ikut
      // rentak sebenar buku daftar kertas (kemasukan awal di atas).
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

// Bilangan (lajur pertama buku daftar) - AUTO ikut turutan sistem (1,2,3...),
// dikira daripada bilangan rekod sedia ada + 1 semasa cipta rekod baru.
// Kekal STABIL selepas disimpan (tak dikira semula bila padam rekod lain -
// padam rekod tengah tak anjak nombor rekod lain, sama macam buku kertas
// sebenar yang nombor muka surat kekal walaupun ada helaian koyak).
export async function tambahDaftarMasuk(data, bilanganSeterusnya, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    ...data,
    bilangan: bilanganSeterusnya,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}

export async function kemaskiniDaftarMasuk(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamDaftarMasuk(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Import pukal (CSV data lama) - TAMBAH sahaja (bukan ganti/padam sedia
// ada, tak macam import Murid) - guna Bilangan TERUS daripada CSV (bukan
// auto-kira) sebab data lama biasanya dah ada nombor asal daripada buku
// kertas sebenar yang perlu dikekalkan.
export async function importPukalDaftarMasuk(baris, uid, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const SAIZ_KELOMPOK = 400
  let selesai = 0
  for (let i = 0; i < baris.length; i += SAIZ_KELOMPOK) {
    const kumpulan = baris.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((b) => {
      const ref = doc(collection(db, KOLEKSI))
      batch.set(ref, {
        muridId: b.murid.id,
        muridNama: b.murid.nama,
        bilangan: b.mentah.bilangan ? Number(b.mentah.bilangan) : null,
        bilanganSuratBeranak: b.mentah.bilanganSuratBeranak || '',
        tempatDiperanakkan: b.mentah.tempatDiperanakkan || '',
        noKebenaran: b.mentah.noKebenaran || '',
        sekolahDahulu: b.mentah.sekolahDahulu || '',
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
