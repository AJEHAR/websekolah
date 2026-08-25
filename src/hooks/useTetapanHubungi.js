import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Maklumat page Hubungi (Alamat/Telefon/Faks/Facebook) - guna koleksi
// 'tetapanAwam' (sama macam suis pendaftaran) sebab page Hubungi TERBUKA
// kepada sesiapa sahaja (termasuk pengunjung belum log masuk), jadi
// maklumat ni kena boleh dibaca tanpa log masuk pun.
const LALAI = {
  alamat: 'No. 1, Bandar Indera Mahkota 2, 25200 Kuantan, Pahang',
  telefon: '09-5739495',
  faks: '09-5739496',
  facebook: 'https://www.facebook.com/skpk.kuantan/',
}

export function useTetapanHubungi() {
  const [tetapan, setTetapan] = useState(LALAI)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let batal = false
    async function muat() {
      if (!isFirebaseConfigured) {
        if (!batal) setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'tetapanAwam', 'hubungi'))
        if (!batal && snap.exists()) setTetapan({ ...LALAI, ...snap.data() })
      } finally {
        if (!batal) setLoading(false)
      }
    }
    muat()
    return () => { batal = true }
  }, [])

  return { tetapan, loading }
}

export async function simpanTetapanHubungi(data, adminUid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(
    doc(db, 'tetapanAwam', 'hubungi'),
    { ...data, updatedAt: serverTimestamp(), updatedBy: adminUid },
    { merge: true }
  )
}
