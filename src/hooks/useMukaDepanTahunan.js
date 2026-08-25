import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'mukaDepanTahunan'

// Satu dokumen setiap TAHUN (docId = tahun, cth. "2026") - reka bentuk
// gambar muka depan kertas kerja yang SAMA dipakai sepanjang tahun tu.
// Mana-mana staff diluluskan boleh muat naik/tukar (bukan admin sahaja).
export function useMukaDepanTahunan(tahun) {
  const [muka, setMuka] = useState(null)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun) {
      setMuka(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, String(tahun)))
      setMuka(snap.exists() ? snap.data() : null)
    } finally {
      setLoading(false)
    }
  }, [tahun])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { muka, loading, muatSemula }
}

export async function simpanMukaDepanTahunan(tahun, gambarUrl, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(
    doc(db, KOLEKSI, String(tahun)),
    { gambarUrl, updatedAt: serverTimestamp(), updatedBy: uid },
    { merge: true }
  )
}

// Guna di luar hook (cth. semasa sediakan cetakan untuk pelbagai tahun
// sekaligus) - ambil sekali sahaja, bukan langgan (subscribe) macam hook.
export async function dapatkanMukaDepanTahunan(tahun) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, KOLEKSI, String(tahun)))
  return snap.exists() ? snap.data() : null
}
