import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'oprTetapan'
const KOSONG = { namaSekolah: '', subHeader1: '', subHeader2: '' }

// Header/sub-header cetakan OPR - BOLEH EDIT khusus OPR sahaja (BUKAN
// NAMA_SEKOLAH tetap dari rpiConstants.js yang dikongsi RPT/RPI/Kertas
// Kerja - modul-modul tu SENGAJA tak disentuh). Kini 3 medan (nama
// sekolah + 2 baris sub-tajuk) - dipapar SAMA di Gaya 1 & Gaya 2 (staff
// minta konsisten, bukan Gaya 2 sahaja). Kosong = guna teks lalai sistem.
// Satu dokumen SETIAP SEKSYEN (docId = "namaSekolah_{seksyen}").
export function useOprNamaSekolah(seksyen) {
  const [header, setHeaderState] = useState(KOSONG)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !seksyen) {
      setHeaderState(KOSONG)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, `namaSekolah_${seksyen}`))
      setHeaderState(snap.exists() ? { ...KOSONG, namaSekolah: snap.data().nama ?? '', subHeader1: snap.data().subHeader1 ?? '', subHeader2: snap.data().subHeader2 ?? '' } : KOSONG)
    } finally {
      setLoading(false)
    }
  }, [seksyen])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  // namaSekolah dipulangkan berasingan (rentetan) untuk keserasian kod
  // sedia ada (Gaya1/Gaya2 guna {namaSekolah}) - subHeader1/2 baharu.
  return { namaSekolah: header.namaSekolah, subHeader1: header.subHeader1, subHeader2: header.subHeader2, loading, muatSemula }
}

export async function simpanOprNamaSekolah(seksyen, { namaSekolah, subHeader1, subHeader2 }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, `namaSekolah_${seksyen}`), {
    nama: namaSekolah.trim(), subHeader1: subHeader1.trim(), subHeader2: subHeader2.trim(),
    seksyen, updatedBy: uid,
  })
}
