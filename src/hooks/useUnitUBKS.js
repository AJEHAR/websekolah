import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'unitUBKS'

// Satu unit ikut ID - untuk halaman detail unit (subpage
// /eubks/murid-ubks/:unitId), bukan senarai ikut tahun.
export function useUnitUBKSSatu(unitId) {
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !unitId) {
      setUnit(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, unitId))
      setUnit(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    } finally {
      setLoading(false)
    }
  }, [unitId])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { unit, loading, muatSemula }
}

export function useUnitUBKSTahun(tahunSesi) {
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
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [tahunSesi])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Semua unit UBKS SEMUA tahun (bukan hook - fungsi sekali panggil) - untuk
// Profil Murid UBKS (perlu tengok sejarah keahlian merentasi tahun, bukan
// satu sesi sahaja). Kos bacaan cuma bila profil dibuka, bukan setiap
// muat page.
export async function ambilSemuaUnitUBKS() {
  if (!isFirebaseConfigured) return []
  const snap = await getDocs(collection(db, KOLEKSI))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function tambahUnit(tahunSesi, namaUnit, kategoriUnit, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = await addDoc(collection(db, KOLEKSI), {
    tahunSesi: String(tahunSesi),
    namaUnit,
    kategoriUnit,
    gambarUnit: null,
    ahli: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
  return ref.id // supaya boleh terus navigate ke halaman detail unit baru
}

export async function kemaskiniUnit(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamUnit(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
