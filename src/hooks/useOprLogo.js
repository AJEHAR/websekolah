import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprTetapan'
const DOK_ID = 'logo'

// Satu dokumen sahaja - senarai logo (maksimum 3) dipaparkan SEBARIS di
// atas setiap cetakan OPR (Gaya 1 & Gaya 2), gantikan logo tunggal
// logo-cetak.png yang dulu dikunci. Kosong = fallback ke logo sekolah asal.
export function useOprLogo() {
  const [logo, setLogo] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setLogo([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, DOK_ID))
      setLogo(snap.exists() ? (snap.data().logo ?? []) : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { logo, loading, muatSemula }
}

export async function simpanOprLogo(senaraiUrl, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, DOK_ID), { logo: senaraiUrl.slice(0, 3), updatedBy: uid })
}
