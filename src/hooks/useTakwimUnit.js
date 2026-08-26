import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'takwimUnit'

// 4 unit induk utama sekolah - AUTO-SEDIA sekali sahaja bila koleksi kosong
// (staff pertama buka Takwim, bukan perlu admin sediakan dulu secara
// manual). Admin boleh tambah Unit/Sub Unit lain lepas ni terus di page
// Takwim sendiri (bukan Panel Admin berasingan). SEMUA unit lalai ni
// UNIT INDUK (unitIndukId kosong) - sekolah tambah Sub Unit (dulu dipanggil
// "Panitia") sendiri di bawah unit yang berkenaan (cth. Sub Unit "Pengakap",
// "Kadet Remaja Sekolah" di bawah Unit induk "Kokurikulum").
const UNIT_LALAI = [
  { namaUnit: 'Pentadbiran', warna: '#C8102E', unitIndukId: null },
  { namaUnit: 'Kurikulum', warna: '#2563EB', unitIndukId: null },
  { namaUnit: 'Hal Ehwal Murid', warna: '#16A34A', unitIndukId: null },
  { namaUnit: 'Kokurikulum', warna: '#F2C230', unitIndukId: null },
]

export function useTakwimUnit() {
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
      let snap = await getDocs(collection(db, KOLEKSI))
      if (snap.empty) {
        const batch = writeBatch(db)
        UNIT_LALAI.forEach((u) => {
          const ref = doc(collection(db, KOLEKSI))
          batch.set(ref, { ...u, createdAt: serverTimestamp() })
        })
        await batch.commit()
        snap = await getDocs(collection(db, KOLEKSI))
      }
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? ''))
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

export async function tambahTakwimUnit(namaUnit, warna, uid, unitIndukId = null) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { namaUnit, warna, unitIndukId: unitIndukId || null, createdAt: serverTimestamp(), updatedBy: uid })
}

export async function kemaskiniTakwimUnit(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedBy: uid })
}

export async function padamTakwimUnit(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
