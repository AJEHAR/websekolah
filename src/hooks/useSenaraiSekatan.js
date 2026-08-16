import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

const KOLEKSI = 'emelDisekat'

// Untuk Panel Admin - senarai penuh emel yang disekat kekal, + urus (tambah/buka sekatan).
export function useSenaraiSekatan() {
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
      const snap = await getDocs(collection(db, KOLEKSI))
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (b.disekatPada?.seconds ?? 0) - (a.disekatPada?.seconds ?? 0))
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

// Sekat emel kekal daripada mendaftar semula (dipanggil dari MenungguKelulusan
// bila admin klik "Tolak & Sekat Kekal", ATAU terus dari page urus sekatan).
export async function sekatEmel(emel, sebab, adminEmel, adminNama) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, emelKeDocId(emel)), {
    emel: emel.trim().toLowerCase(),
    sebab: sebab || '',
    disekatOlehEmel: adminEmel,
    disekatOlehNama: adminNama,
    disekatPada: serverTimestamp(),
  })
}

export async function bukaSekatan(emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, emelKeDocId(emel)))
}
