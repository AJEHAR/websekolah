import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const SAIZ_KELOMPOK = 400 // had Firestore batch = 500, guna 400 untuk selamat

// Rekod emel & kata laluan akaun DELIMa (portal pembelajaran digital KPM)
// bagi setiap murid - guru kelas simpan sbg rujukan sebab murid
// berkeperluan khas selalunya tak urus akaun sendiri. docId = SAMA dgn ID
// murid (koleksi 'murid') supaya satu dokumen sahaja setiap murid, senang
// get/set terus tanpa query berasingan.
const KOLEKSI = 'kurikulumDelima'

export function useKurikulumDelimaSenarai() {
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
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function simpanKurikulumDelima(muridId, { emel, kataLaluan, catatan, nama }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  // { merge: true } - elak timpa kosong medan kelasDelima/moeisId yang
  // datang dari import CSV (lihat importPukalKurikulumDelima di bawah).
  // `nama` - SNAPSHOT nama murid semasa disimpan (bukan rujukan langsung
  // ke koleksi 'murid') - kekal senang dibaca dlm tab "Rekod Tak Sepadan"
  // walaupun murid tu kemudian dipadam terus dari koleksi 'murid' (cth.
  // sync semula Excel bila murid dah tamat/pindah - lihat useMurid.js
  // gantiSemuaMurid, yang PADAM TERUS rekod murid tiada dlm fail baru).
  await setDoc(doc(db, KOLEKSI, muridId), {
    emel: emel.trim(), kataLaluan: kataLaluan.trim(), catatan: (catatan ?? '').trim(),
    ...(nama ? { nama } : {}),
    updatedAt: serverTimestamp(), updatedBy: uid,
  }, { merge: true })
}

export async function padamKurikulumDelima(muridId) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, muridId))
}

// Padam BEBERAPA rekod sekali gus - untuk tab "Rekod Tak Sepadan" (cleanup
// pukal murid yang dah tiada dlm koleksi 'murid').
export async function padamKurikulumDelimaPukal(muridIds) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  for (let i = 0; i < muridIds.length; i += SAIZ_KELOMPOK) {
    const kumpulan = muridIds.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((muridId) => batch.delete(doc(db, KOLEKSI, muridId)))
    await batch.commit()
  }
  return { bilangan: muridIds.length }
}

// Tetapkan SATU kata laluan yang SAMA pada beberapa murid dipilih sekali
// gus - staff KPK selalunya guna satu kata laluan piawai untuk semua
// murid (kecuali yang baru dikemas kini secara individu - staff NYAHPILIH
// murid tu dulu sebelum "Terapkan", jadi rekod dia tak disentuh langsung).
// `{ merge: true }` - emel/kelasDelima/moeisId/catatan sedia ada KEKAL,
// cuma kataLaluan (+ updatedAt/updatedBy) yang ditulis ganti.
export async function tetapkanKataLaluanPukal(muridIds, kataLaluan, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const kataLaluanBersih = kataLaluan.trim()
  for (let i = 0; i < muridIds.length; i += SAIZ_KELOMPOK) {
    const kumpulan = muridIds.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((muridId) => {
      batch.set(doc(db, KOLEKSI, muridId), {
        kataLaluan: kataLaluanBersih, updatedAt: serverTimestamp(), updatedBy: uid,
      }, { merge: true })
    })
    await batch.commit()
  }
  return { bilangan: muridIds.length }
}

// Import PUKAL dari fail CSV DELIMa (lihat delimaCsvImport.js) - HANYA
// baris yang berjaya sepadan dgn Murid semasa (muridId != null) yang
// diimport. `{ merge: true }` WAJIB di sini - fail CSV rasmi DELIMa TAK
// ADA kata laluan, jadi import ni cuma isi/kemas kini emel + rujukan
// kelas/MOEIS ID; kata laluan & catatan yang staff dah isi manual
// sebelum ni KEKAL, tak ditimpa kosong.
export async function importPukalKurikulumDelima(barisSepadan, uid, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  let selesai = 0
  for (let i = 0; i < barisSepadan.length; i += SAIZ_KELOMPOK) {
    const kumpulan = barisSepadan.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((b) => {
      const ref = doc(db, KOLEKSI, b.muridId)
      batch.set(ref, {
        emel: b.emel, kelasDelima: b.kelas, moeisId: b.moeisId, nama: b.nama,
        updatedAt: serverTimestamp(), updatedBy: uid,
      }, { merge: true })
    })
    await batch.commit()
    selesai += kumpulan.length
    onProgress?.(selesai, barisSepadan.length)
  }
  return { bilangan: barisSepadan.length }
}
