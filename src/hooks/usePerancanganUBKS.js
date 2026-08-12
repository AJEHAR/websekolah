import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'perancanganUBKS'

// Satu dokumen sahaja setiap unit - ID dokumen = ID unit terus (mudah, tiada mod).
export function idPerancangan(unitId) {
  return unitId
}

export function senaraiKosong() {
  return Array.from({ length: 12 }, (_, i) => ({
    perjumpaan: i + 1,
    perancangan: '',
    tarikh: '',
    selesai: false,
    tarikhSelesai: null,
  }))
}

export async function muatkanPerancangan(unitId) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idPerancangan(unitId))
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Semua dokumen perancangan untuk satu tahun sesi - untuk kad unit tunjuk
// status/progres (ada perancangan atau tidak, berapa peratus selesai).
export function useSenaraiPerancanganTahun(tahunSesi) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahunSesi) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahunSesi', '==', String(tahunSesi)))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tahunSesi])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function simpanPerancangan(unitId, namaUnit, tahunSesi, senaraiPerjumpaan, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idPerancangan(unitId))
  await setDoc(ref, {
    unitId,
    namaUnit,
    tahunSesi: String(tahunSesi),
    senaraiPerjumpaan,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}
