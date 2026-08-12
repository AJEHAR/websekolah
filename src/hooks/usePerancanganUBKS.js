import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'perancanganUBKS'

// mode 'sama' -> satu dokumen untuk seluruh unit.
// mode 'asing' -> satu dokumen setiap tahun/darjah dalam unit tu.
export function idPerancangan(unitId, mode, tahunDarjah) {
  return mode === 'sama' ? unitId : `${unitId}__${tahunDarjah}`
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

export async function muatkanPerancangan(unitId, mode, tahunDarjah) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idPerancangan(unitId, mode, tahunDarjah))
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Semua dokumen perancangan sedia ada untuk satu unit - untuk detect mode
// (sama/asing) yang dah dipilih sebelum ni, dan senarai tahun/darjah yang dah ada.
export async function senaraiDokUntukUnit(unitId) {
  if (!isFirebaseConfigured) return []
  const q = query(collection(db, KOLEKSI), where('unitId', '==', unitId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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

export async function simpanPerancangan(unitId, namaUnit, tahunSesi, mode, tahunDarjah, senaraiPerjumpaan, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idPerancangan(unitId, mode, tahunDarjah))
  await setDoc(ref, {
    unitId,
    namaUnit,
    tahunSesi: String(tahunSesi),
    mode,
    tahunDarjah: mode === 'asing' ? tahunDarjah : null,
    senaraiPerjumpaan,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}
