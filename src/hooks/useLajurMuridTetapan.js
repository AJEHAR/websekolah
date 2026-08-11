import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Satu dokumen tetapan sahaja: tetapan/lajurMurid
// { [kunciMedan]: false } bermakna lajur tu DISOROK. Tiada entri = kelihatan (default).

export function useLajurMuridTetapan() {
  const [tetapan, setTetapan] = useState({})
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'tetapan', 'lajurMurid'))
      setTetapan(snap.exists() ? snap.data() : {})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { tetapan, loading, muatSemula }
}

export async function simpanLajurTetapan(tetapan) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, 'tetapan', 'lajurMurid'), tetapan)
}

export function lajurKelihatan(tetapan, kunci) {
  return tetapan[kunci] !== false
}
