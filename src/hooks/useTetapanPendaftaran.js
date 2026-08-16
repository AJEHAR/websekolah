import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Suis awam "pendaftaran staff baru dibuka/ditutup" - perlu boleh dibaca oleh
// SESIAPA (termasuk pengunjung belum log masuk langsung), sebab kena tentukan
// sama ada nak tunjuk butang "Daftar" SEBELUM orang tu log masuk pun. Ini
// sebabnya guna koleksi 'tetapanAwam' berasingan (bukan 'tetapan' sedia ada,
// yang dihadkan kepada staff diluluskan sahaja).
const REF_DOC = 'tetapanAwam/pendaftaran'

export function useTetapanPendaftaran() {
  const [dibuka, setDibuka] = useState(true) // lalai terbuka sehingga admin tutup
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let batal = false
    async function muat() {
      if (!isFirebaseConfigured) {
        if (!batal) setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'tetapanAwam', 'pendaftaran'))
        if (!batal) setDibuka(snap.exists() ? snap.data().dibuka !== false : true)
      } finally {
        if (!batal) setLoading(false)
      }
    }
    muat()
    return () => { batal = true }
  }, [])

  return { dibuka, loading }
}

export async function tetapkanPendaftaran(dibuka, adminUid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(
    doc(db, 'tetapanAwam', 'pendaftaran'),
    { dibuka, updatedAt: serverTimestamp(), updatedBy: adminUid },
    { merge: true }
  )
}
