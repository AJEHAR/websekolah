import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsTetapanYuran'
const LALAI = { bilanganBulan: 12, yuranBulanan: 15 }

// Tetapan Yuran - SATU dokumen SETIAP TAHUN (docId = tahun, cth "2026")
// - bilanganBulan (10-12) & kadar bulanan (RM) ditetapkan SEKALI untuk
// seluruh tahun tu, terpakai kepada semua ahli (override individu ada
// di kkgsAhli.bulanMula/bulanTamat - lihat kkgsConstants.js).
export function useKkgsTetapanYuran(tahun) {
  const [tetapan, setTetapan] = useState(LALAI)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun) {
      setTetapan(LALAI)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, String(tahun)))
      setTetapan(snap.exists() ? { ...LALAI, ...snap.data() } : LALAI)
    } finally {
      setLoading(false)
    }
  }, [tahun])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { tetapan, loading, muatSemula }
}

export async function simpanTetapanYuran(tahun, { bilanganBulan, yuranBulanan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, String(tahun)), {
    bilanganBulan: Number(bilanganBulan), yuranBulanan: Number(yuranBulanan), updatedBy: uid,
  })
}
