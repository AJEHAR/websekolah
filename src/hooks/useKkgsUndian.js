import { useEffect, useState } from 'react'
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsUndian'

// Undian SATU jawatan SATU pengundi = SATU dokumen, ID DETERMINISTIK
// `${pilihanRayaId}_${slug(jawatan)}_${uid}` - fungsi PENTING ni yang
// jadi kunci elak undi dua kali: firestore.rules benarkan "create"
// SAHAJA (bukan "update") untuk koleksi ni, jadi percubaan hantar KALI
// KEDUA (ID sama) automatik ditolak sistem sebagai operasi "update" -
// tanpa perlu query semak dulu di klien (elak race condition juga).
function idUndian(pilihanRayaId, jawatan, uid) {
  const slug = jawatan.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${pilihanRayaId}_${slug}_${uid}`
}

// Hantar undian untuk PUSINGAN SEMASA sahaja (undian LIVE, satu jawatan
// satu masa - bukan semua jawatan sekali gus lagi). Firestore.rules
// semak SEKALI LAGI sisi server yang pusingan tu memang jawatan SEMASA
// & masih 'berjalan' - jadi walaupun staff cuba hantar lepas pusingan
// ditutup (cth. lambat submit), rules tolak automatik.
export async function hantarUndianPusingan(pilihanRayaId, jawatan, calonIds, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const rujukan = doc(db, KOLEKSI, idUndian(pilihanRayaId, jawatan, uid))
  await setDoc(rujukan, {
    pilihanRayaId, jawatan, calonIds, pengundiUid: uid,
    dicipta: serverTimestamp(),
  })
}

// Semak undian SEDIA ADA pengundi semasa untuk SATU sesi (merentasi
// SEMUA pusingan setakat ni) - untuk paparan "Anda dah undi pusingan
// ni ✓" & sekat borang lepas hantar.
export function useUndianSaya(pilihanRayaId, uid) {
  const [jawatanSudahUndi, setJawatanSudahUndi] = useState(new Set())
  const [loading, setLoading] = useState(true)

  async function muatSemula() {
    if (!isFirebaseConfigured || !pilihanRayaId || !uid) {
      setJawatanSudahUndi(new Set())
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('pilihanRayaId', '==', pilihanRayaId), where('pengundiUid', '==', uid))
      const snap = await getDocs(q)
      setJawatanSudahUndi(new Set(snap.docs.map((d) => d.data().jawatan)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    muatSemula()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilihanRayaId, uid])

  return { jawatanSudahUndi, loading, muatSemula }
}

// Tally LIVE (real-time) pusingan SEMASA - guna onSnapshot (BUKAN corak
// getDocs+muatSemula manual yang dipakai di seluruh sistem lain) supaya
// nombor kiraan bertambah SENDIRI di skrin admin/projektor semasa
// mesyuarat, tanpa staff kena refresh - inilah ciri "undian LIVE" yang
// diminta. HANYA admin 'kkgs' ada kebenaran baca semua dokumen jawatan
// ni (firestore.rules) - pastikan hook ni cuma dipanggil dalam panel
// admin, BUKAN borang staff biasa (yang cuma boleh baca undian SENDIRI).
export function useTalliLive(pilihanRayaId, jawatan, aktif) {
  const [undian, setUndian] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !pilihanRayaId || !jawatan || !aktif) {
      setUndian([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const q = query(collection(db, KOLEKSI), where('pilihanRayaId', '==', pilihanRayaId), where('jawatan', '==', jawatan))
    const nyahlanggan = onSnapshot(q, (snap) => {
      setUndian(snap.docs.map((d) => d.data()))
      setLoading(false)
    }, () => setLoading(false))
    return () => nyahlanggan()
  }, [pilihanRayaId, jawatan, aktif])

  // Kira undi per calon dari senarai dokumen mentah (setiap dokumen
  // boleh ada BERBILANG calonIds - kes AJK KKGS berbilang kerusi).
  const kiraan = {}
  undian.forEach((u) => {
    (u.calonIds || []).forEach((id) => {
      kiraan[id] = (kiraan[id] || 0) + 1
    })
  })
  const tersusun = Object.entries(kiraan).map(([calonId, jumlah]) => ({ calonId, jumlah })).sort((a, b) => b.jumlah - a.jumlah)

  return { keputusan: tersusun, jumlahPengundi: undian.length, loading }
}

// Tally SEKALI SAHAJA (getDocs, bukan live) - dipanggil admin bila
// TUTUP pusingan (tentukan pemenang pusingan tu). Guna getDocs (bukan
// bergantung state onSnapshot yang mungkin belum sempat sampai) supaya
// keputusan tepat angka SEMASA butang "Tutup Pusingan" ditekan.
export async function kiraTallyPusingan(pilihanRayaId, jawatan) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const q = query(collection(db, KOLEKSI), where('pilihanRayaId', '==', pilihanRayaId), where('jawatan', '==', jawatan))
  const snap = await getDocs(q)
  const kiraan = {}
  snap.docs.forEach((d) => {
    (d.data().calonIds || []).forEach((id) => {
      kiraan[id] = (kiraan[id] || 0) + 1
    })
  })
  return Object.entries(kiraan).map(([calonId, undi]) => ({ calonId, undi })).sort((a, b) => b.undi - a.undi)
}
