import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'laporan3K'

function idRekod(tarikh, blokId) {
  return `${tarikh}_${blokId}`
}

// Semua rekod untuk satu tarikh (satu rekod per blok)
export function useLaporan3KTarikh(tarikh) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tarikh) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tarikh', '==', tarikh))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tarikh])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Simpan (cipta ATAU kemas kini - ID deterministik tarikh_blokId elak duplikasi)
export async function simpanLaporan3K(tarikh, blokId, blokNama, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idRekod(tarikh, blokId))
  await setDoc(
    ref,
    { tarikh, blokId, blokNama, ...data, updatedAt: serverTimestamp(), updatedBy: uid },
    { merge: true }
  )
}
