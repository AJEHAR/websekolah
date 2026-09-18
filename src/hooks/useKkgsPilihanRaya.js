import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, deleteField, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsPilihanRaya'

// Satu dokumen = SATU sesi Pilihan Raya KKGS (cth. "2026"). Undian
// berjalan SATU PUSINGAN SATU JAWATAN SETIAP MASA (LIVE, ada tempoh
// masa/timer) - BUKAN semua jawatan sekali gus - lihat
// JAWATAN_URUTAN_PILIHAN_RAYA (kkgsConstants.js) untuk susunan tetap.
//
// Medan pusingan pada dokumen ni:
//   pusinganIndeks  - -1 (belum mula) hingga 5 (indeks dalam
//                     JAWATAN_URUTAN_PILIHAN_RAYA)
//   pusinganJawatan - nama jawatan pusingan SEMASA/TERAKHIR (string,
//                     disimpan berasingan drpd indeks supaya
//                     firestore.rules senang banding terus tanpa perlu
//                     tahu susunan array)
//   pusinganStatus  - 'menunggu' (belum mula LANGSUNG lagi, sebelum
//                     pusingan pertama) | 'berjalan' (staff boleh undi,
//                     timer jalan) | 'ditutup' (pusingan ni ditutup,
//                     pemenang dah ditentukan, admin belum tekan "mula
//                     pusingan seterusnya" lagi)
//   pusinganTamatPada - millis (Date.now() client admin bila pusingan
//                     dibuka + tempohSaat*1000) - staff kira baki masa
//                     client-side dari ni, TIADA cron/Cloud Function
//                     perlu (lihat CountdownTimer di PilihanRayaKKGS.jsx)
//   tempohSaat      - tempoh (saat) pusingan TERAKHIR dibuka - admin
//                     boleh ubah nilai ni SETIAP KALI buka pusingan
//                     baharu (bukan tetapan tetap seluruh sesi)
//   pemenang        - { [jawatan]: calonId } untuk jawatan SATU orang,
//                     { [JAWATAN_AJK_PILIHAN_RAYA]: [calonId,...] }
//                     untuk AJK KKGS - diisi SECARA BERPERINGKAT bila
//                     SETIAP pusingan ditutup (bukan sekali gus di
//                     hujung), jadi staff nampak keputusan diumum
//                     LIVE pusingan demi pusingan. Medan ni TELUS untuk
//                     SEMUA staff (rule read biasa) - undian MENTAH
//                     (kkgsUndian) kekal sulit selama-lamanya, lihat
//                     useKkgsUndian.js.
export function useKkgsPilihanRayaSenarai() {
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
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (b.tahun ?? 0) - (a.tahun ?? 0))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function ciptaPilihanRaya({ tahun, bilanganKerusiAjk }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const rujukan = doc(collection(db, KOLEKSI))
  await setDoc(rujukan, {
    tahun: Number(tahun),
    bilanganKerusiAjk: Number(bilanganKerusiAjk) || 5,
    status: 'draf',
    tidakLayak: [],
    pusinganIndeks: -1,
    pusinganJawatan: null,
    pusinganStatus: 'menunggu',
    pusinganTamatPada: null,
    tempohSaat: null,
    pemenang: {},
    butiranPusingan: {},
    createdAt: serverTimestamp(), createdBy: uid,
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
  return rujukan.id
}

// Pengecualian calon - HANYA dibenarkan sisi UI sebelum pusingan
// PERTAMA bermula (pusinganIndeks === -1) - elak ubah kelayakan calon
// PERTENGAHAN pilihan raya (tak adil).
export async function kemaskiniTidakLayakPilihanRaya(id, tidakLayak, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { tidakLayak, updatedAt: serverTimestamp(), updatedBy: uid })
}

// Ubah bilangan kerusi AJK KKGS - HANYA dibenarkan sisi UI sebelum
// pusingan PERTAMA bermula (sama sebab macam tidakLayak di atas).
export async function kemaskiniTetapanPilihanRaya(id, { bilanganKerusiAjk }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { bilanganKerusiAjk: Number(bilanganKerusiAjk), updatedAt: serverTimestamp(), updatedBy: uid })
}

// Buka SATU pusingan (pertama atau seterusnya) - tetapkan jawatan
// semasa + mula timer. status sesi bertukar 'berjalan' dari sini
// (draf -> berjalan) bila pusingan PERTAMA dibuka.
export async function mulakanPusingan(id, { indeks, jawatan, tempohSaat }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), {
    status: 'berjalan',
    pusinganIndeks: indeks,
    pusinganJawatan: jawatan,
    pusinganStatus: 'berjalan',
    pusinganTamatPada: Date.now() + Number(tempohSaat) * 1000,
    tempohSaat: Number(tempohSaat),
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

// Tutup pusingan SEMASA - rekod pemenang (dikira sisi klien admin dari
// kiraTallyPusingan(), lihat useKkgsUndian.js) ke dalam peta "pemenang"
// (medan bertitik "pemenang.<jawatan>" - kemaskini SATU entri sahaja,
// TAK timpa pemenang pusingan lain yang dah direkod sebelum ni). "butiran"
// (senarai PENUH {calonId,undi} tersusun menurun) turut disimpan dalam
// "butiranPusingan.<jawatan>" - PENTING untuk laporan/cetak PDF (supaya
// keputusan penuh dengan jumlah undi kekal ada, bukan sekadar nama
// pemenang, walaupun undian mentah kkgsUndian dipadam/luput kemudian).
// selesaiSesi=true (pusingan AJK KKGS, yang terakhir) turut tutup
// SESI KESELURUHAN ('selesai') - tiada apa lagi diundi lepas ni.
export async function tutupPusingan(id, { jawatan, pemenangBaru, butiran, selesaiSesi }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), {
    [`pemenang.${jawatan}`]: pemenangBaru,
    [`butiranPusingan.${jawatan}`]: butiran,
    pusinganStatus: 'ditutup',
    status: selesaiSesi ? 'selesai' : 'berjalan',
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

// Buka SEMULA pusingan yang BARU SAHAJA ditutup (pembetulan - cth. admin
// tersilap tekan "Tutup Pusingan" awal, atau nak sambung tempoh) - HANYA
// masuk akal SEMASA pusinganStatus === 'ditutup' DAN pusingan SETERUSNYA
// BELUM dibuka lagi (disekat sisi UI - lihat PilihanRayaKKGS.jsx). Buang
// balik pemenang/butiran pusingan ni (deleteField, bukan set null - elak
// "Belum Diputuskan" tersalah anggap pusingan lain), pusingan kembali
// 'berjalan' dengan timer BAHARU. Undian yang DAH masuk sebelum ni KEKAL
// (tak dipadam) - staff yang dah undi tetap tercatat "dah undi", cuma
// pusingan dibuka semula untuk staff yang BELUM sempat undi.
export async function bukaSemulaPusingan(id, jawatan, tempohSaat, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), {
    [`pemenang.${jawatan}`]: deleteField(),
    [`butiranPusingan.${jawatan}`]: deleteField(),
    pusinganStatus: 'berjalan',
    status: 'berjalan',
    pusinganTamatPada: Date.now() + Number(tempohSaat) * 1000,
    tempohSaat: Number(tempohSaat),
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

// Padam sesi - dibenarkan BILA-BILA status (draf/berjalan/selesai), UI
// (PilihanRayaKKGS.jsx) papar amaran BERBEZA ikut kemajuan sesi (lebih
// tegas kalau dah ada undi/keputusan sebenar). NOTA: dokumen undian
// mentah (kkgsUndian) yang sudah dihantar TIDAK dipadam serentak (bukan
// subcollection, rekod berasingan) - ia jadi "yatim" (tak boleh diakses
// lagi sebab rule kkgsUndian bergantung dokumen sesi ni wujud) tapi
// tetap wujud dalam pangkalan data - cukup untuk elak kehilangan data
// tanpa perlu cascade-delete kompleks; kesan praktikal: sifar (rekod tu
// dah tak boleh dirujuk apa-apa cara lagi selepas sesi dipadam).
export async function padamPilihanRaya(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
