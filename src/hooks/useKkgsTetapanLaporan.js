import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Nama sekolah dipapar di kepala (letterhead) setiap Laporan Kewangan KKGS
// yang dicetak - BOLEH admin KKGS edit sendiri (bukan hardcode dalam kod),
// disimpan berasingan drpd NAMA_SEKOLAH tetap yang dikongsi modul
// RPT/RPI/Kertas Kerja (rpiConstants.js) - sama konsep dgn cara OPR ada
// tetapan header sendiri (useOprNamaSekolah.js).
//
// PENTING: guna DOKUMEN & KOLEKSI SAMA dgn Baki Pembukaan
// (kkgsTetapanUmum/utama - lihat useKkgsBakiPembukaan.js) supaya TAK
// perlu tambah peraturan Firestore baharu (dah ada kebenaran admin='kkgs'
// tulis, semua staff baca). setDoc WAJIB guna { merge: true } di sini
// (dan di useKkgsBakiPembukaan.js) supaya kedua-dua tetapan yang kongsi
// dokumen sama TAK saling timpa/padam medan satu sama lain.
const KOLEKSI = 'kkgsTetapanUmum'
const DOC_ID = 'utama'

export function useKkgsNamaSekolahLaporan() {
  const [namaSekolah, setNamaSekolahState] = useState('')
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setNamaSekolahState('')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, DOC_ID))
      setNamaSekolahState(snap.exists() ? (snap.data().namaSekolah ?? '') : '')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { namaSekolah, loading, muatSemula }
}

export async function simpanKkgsNamaSekolahLaporan(namaSekolah, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, DOC_ID), { namaSekolah: namaSekolah.trim(), updatedBy: uid }, { merge: true })
}
