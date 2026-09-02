import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprTetapan'

// Satu dokumen SETIAP SEKSYEN (docId = "logo_{seksyen}") - senarai logo
// (maksimum 3) dipaparkan sebaris di atas setiap cetakan OPR seksyen tu -
// BERASINGAN ikut KURI/HEM/KOKU (setiap bahagian boleh guna logo lain).
export function useOprLogo(seksyen) {
  const [logo, setLogo] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !seksyen) {
      setLogo([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, `logo_${seksyen}`))
      setLogo(snap.exists() ? (snap.data().logo ?? []) : [])
    } finally {
      setLoading(false)
    }
  }, [seksyen])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { logo, loading, muatSemula }
}

export async function simpanOprLogo(seksyen, senaraiUrl, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, `logo_${seksyen}`), { logo: senaraiUrl.slice(0, 3), seksyen, updatedBy: uid })
}
