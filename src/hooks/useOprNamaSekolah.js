import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprTetapan'

// Nama sekolah dalam cetakan OPR - BOLEH EDIT khusus OPR sahaja (BUKAN
// NAMA_SEKOLAH tetap dari rpiConstants.js yang dikongsi RPT/RPI/Kertas
// Kerja - modul-modul tu SENGAJA tak disentuh, ikut keputusan pengguna).
// Satu dokumen SETIAP SEKSYEN (docId = "namaSekolah_{seksyen}") - sama
// corak dengan useOprLogo.js.
export function useOprNamaSekolah(seksyen) {
  const [namaSekolah, setNamaSekolahState] = useState('')
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !seksyen) {
      setNamaSekolahState('')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, `namaSekolah_${seksyen}`))
      setNamaSekolahState(snap.exists() ? (snap.data().nama ?? '') : '')
    } finally {
      setLoading(false)
    }
  }, [seksyen])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { namaSekolah, loading, muatSemula }
}

export async function simpanOprNamaSekolah(seksyen, nama, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, `namaSekolah_${seksyen}`), { nama: nama.trim(), seksyen, updatedBy: uid })
}
