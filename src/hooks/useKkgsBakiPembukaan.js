import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const DOC_ID = 'utama'
const KOLEKSI = 'kkgsTetapanUmum'
const LALAI = { bakiPembukaan: 0, tahunPembukaan: new Date().getFullYear() }

// Baki Pembukaan - jumlah wang kelab SEBELUM sistem ni mula jejak rekod
// (cth. kelab dah wujud bertahun sebelum guna sistem ni, ada baki
// terkumpul dari buku tunai fizikal/manual lama). PENTING untuk kira
// "Baki" SEBENAR (terkumpul merentasi tahun) - bukan sekadar Masuk-Keluar
// satu tahun sahaja (lihat useKkgsLedger.js untuk pengiraan penuh).
export function useKkgsBakiPembukaan() {
  const [tetapan, setTetapan] = useState(LALAI)
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setTetapan(LALAI)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, KOLEKSI, DOC_ID))
      setTetapan(snap.exists() ? { ...LALAI, ...snap.data() } : LALAI)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { tetapan, loading, muatSemula }
}

export async function simpanBakiPembukaan({ bakiPembukaan, tahunPembukaan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, DOC_ID), {
    bakiPembukaan: Number(bakiPembukaan), tahunPembukaan: Number(tahunPembukaan), updatedBy: uid,
  })
}
