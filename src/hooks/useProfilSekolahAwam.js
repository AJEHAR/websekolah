import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Kandungan "Maklumat Sekolah > Profil Sekolah" (sejarah, visi/misi, falsafah,
// lencana, lagu sekolah, dll) untuk halaman AWAM (/maklumat-sekolah) - guna
// koleksi 'tetapanAwam' SEDIA ADA (sama macam useTetapanPendaftaran.js), bukan
// koleksi baharu, sebab dah ada peraturan Firestore "boleh baca sesiapa sahaja,
// tulis superadmin sahaja" (firestore.rules match /tetapanAwam/{docId}).
const REF_DOC = ['tetapanAwam', 'profilSekolah']

const KOSONG = {
  sejarahPenubuhan: '',
  alamatBertulis: '',
  lokasiMapEmbedUrl: '',
  pelanKawasanUrl: '',
  pelanKecemasanUrl: '',
  lencanaUrl: '',
  penciptaLencana: '',
  peneranganLencana: [], // [{ label, keterangan }]
  laguJudul: '',
  laguLirik: '',
  laguVideoUrl: '',
  visiKPM: '',
  misiKPM: '',
  falsafahKebangsaan: '',
  falsafahIslam: '',
  falsafahKhas: '',
  visiKhas: '',
  misiKhas: '',
  objektifKhas: [], // [string]
  objektifSekolah: [], // [string]
}

export function useProfilSekolahAwam() {
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

export async function simpanProfilSekolahAwam(data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, ...REF_DOC), { ...data, updatedAt: serverTimestamp(), updatedBy: uid }, { merge: true })
}
