import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsKeahlianTahun'

// Tempoh Bayar Tahunan KKGS - PENGECUALIAN per (ahli, tahun) untuk Bulan
// Mula/Tamat Bayar Yuran. LALAI (takde dokumen di sini langsung) = ahli
// tu dianggap bayar PENUH TAHUN (Januari hingga bilangan bulan tetapan
// tahun tu) - TIADA apa-apa perlu "reset" hujung/awal tahun untuk ahli
// yang KEKAL. Cuma ahli BAHARU (join lewat) atau ahli KELUAR (tamat
// awal) perlukan dokumen di sini, untuk TAHUN BERKENAAN SAHAJA - tahun
// lain (lepas/depan) TIDAK terjejas (fix bug: dulu Bulan Mula/Tamat
// disimpan SATU medan pada kkgsAhli, jadi ubah untuk tahun semasa
// tersalah ubah juga kiraan tahun lepas).
//
// ID dokumen guna corak `${ahliId}_${tahun}` (bukan auto-generate) - jadi
// simpan/kemaskini boleh terus setDoc(..., {merge:true}) tanpa perlu
// query dulu (senang urus "satu override setiap ahli setiap tahun").
function idDoc(ahliId, tahun) {
  return `${ahliId}_${tahun}`
}

// Peta {ahliId: {bulanMula, bulanTamat}} untuk SATU tahun - senang
// dicari terus ikut ahliId semasa kira peruntukan (elak .find() bagi
// setiap ahli setiap kali render).
export function useKkgsKeahlianTahunSenarai(tahun) {
  const [peta, setPeta] = useState({})
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun) {
      setPeta({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahun)))
      const snap = await getDocs(q)
      const petaBaru = {}
      snap.docs.forEach((d) => {
        const data = d.data()
        petaBaru[data.ahliId] = { bulanMula: data.bulanMula, bulanTamat: data.bulanTamat }
      })
      setPeta(petaBaru)
    } finally {
      setLoading(false)
    }
  }, [tahun])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { peta, loading, muatSemula }
}

export async function simpanKeahlianTahun(ahliId, tahun, { bulanMula, bulanTamat }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, idDoc(ahliId, tahun)), {
    ahliId, tahun: Number(tahun), bulanMula, bulanTamat,
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

// Padam override -> ahli tu kembali ke LALAI (penuh tahun) untuk tahun
// berkenaan.
export async function padamKeahlianTahun(ahliId, tahun) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, idDoc(ahliId, tahun)))
}

// Migrasi SEKALI SAHAJA - tarik Bulan Mula/Tamat LAMA yang tersimpan pada
// rekod kkgsAhli (medan lama, sebelum ciri ni wujud) jadi override
// kkgsKeahlianTahun untuk SATU tahun (biasanya tahun semasa sistem ni
// mula pakai ciri baharu). Ahli dengan Bulan Mula=1 & Tamat=12 (lalai
// asal) DILANGKAU - tiada override diperlukan (padan lalai baharu).
// Ahli yang DAH ADA override untuk tahun tu (peta sedia ada) turut
// dilangkau - elak overwrite perubahan admin dah buat.
export async function migrasiKeahlianTahunDariAhli(senaraiAhli, tahun, petaSediaAda, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  let dimigrasi = 0
  for (const ahli of senaraiAhli) {
    const bulanMulaLama = ahli.bulanMula ?? 1
    const bulanTamatLama = ahli.bulanTamat ?? 12
    if (bulanMulaLama === 1 && bulanTamatLama === 12) continue // padan lalai - tak perlu override
    if (petaSediaAda[ahli.id]) continue // dah ada override - jangan timpa
    await simpanKeahlianTahun(ahli.id, tahun, { bulanMula: bulanMulaLama, bulanTamat: bulanTamatLama }, uid)
    dimigrasi += 1
  }
  return { dimigrasi }
}
