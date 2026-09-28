import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { adalahPra, kiraIkutMedan, kiraIkutKelas } from '../pages/MaklumatMurid/statistikMurid.js'

// Statistik Murid untuk halaman Utama AWAM (Jumlah Murid, Lelaki/Perempuan,
// Pendidikan Khas ikut kategori, ikut kelas). PENTING (keselamatan/privasi):
// koleksi 'murid' PENUH (nama, kategori ketidakupayaan dll setiap murid)
// TIDAK didedahkan kepada pelawat awam - cuma ANGKA KESELURUHAN (aggregat)
// disimpan dlm 'tetapanAwam/statistikMurid' (baca sesiapa sahaja, tulis
// superadmin sahaja - sama peraturan dgn useTetapanPendaftaran.js). Admin
// klik "Kemaskini Statistik Awam" (lihat Analisis.jsx) untuk kira semula
// dari data 'murid' SEBENAR dan tulis angka aggregat ni sahaja.
const REF_DOC = ['tetapanAwam', 'statistikMurid']

const KOSONG = { jumlah: 0, jantina: [], kategoriOku: [], ikutKelas: [], updatedAt: null }

export function useStatistikMuridAwam() {
  const [data, setData] = useState(KOSONG)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setData(KOSONG)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, ...REF_DOC))
      setData(snap.exists() ? { ...KOSONG, ...snap.data() } : KOSONG)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { data, loading, muatSemula }
}

// Kira semula dari senarai murid PENUH (dipanggil dgn useMuridList().senarai
// yg admin dah ada dlm ingatan di Analisis.jsx - elak baca 'murid' dua kali)
// dan tulis HANYA angka aggregat ke dok awam.
export async function kemaskiniStatistikMuridAwam(senaraiMurid, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const bukanPra = senaraiMurid.filter((m) => !adalahPra(m))
  const ikutKelasJantina = kiraIkutKelas(senaraiMurid, 'jantina')
  const ikutKelas = Object.entries(ikutKelasJantina)
    .map(([kelas, kiraan]) => ({
      kelas,
      lelaki: kiraan.Lelaki ?? 0,
      perempuan: kiraan.Perempuan ?? 0,
      jumlah: kiraan.__jumlah,
    }))
    .sort((a, b) => b.jumlah - a.jumlah)

  await setDoc(doc(db, ...REF_DOC), {
    jumlah: senaraiMurid.length,
    jantina: kiraIkutMedan(senaraiMurid, 'jantina'),
    kategoriOku: kiraIkutMedan(bukanPra, 'kategoriKetidakupayaan'),
    ikutKelas,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}
