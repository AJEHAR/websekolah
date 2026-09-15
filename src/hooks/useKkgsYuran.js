import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsYuran'

// Log bayaran yuran - SATU dokumen SETIAP bayaran (bukan satu dokumen
// setiap ahli) - senang kira jumlah terkumpul (jumlahkan semua rekod
// ahli tu) tanpa perlu risau format "bulan mana dah bayar" yang berbeza
// ikut cara KKGS urus (bulanan/tahunan/lain) - fleksibel untuk apa jua
// kekerapan bayaran sekolah amalkan. Medan "tahun" (nombor, cth 2026)
// PENTING - kira peruntukan bulan HANYA guna bayaran tahun berkenaan
// (elak bayaran lebih tahun lepas "terbawa" masuk kiraan tahun semasa).
//
// PENTING: susun (sort) tarikh dibuat di KLIEN (bukan orderBy() dalam
// query Firestore) - gabungan where()+orderBy() pada MEDAN BERBEZA
// PERLUKAN "indeks komposit" khas dibuat dulu di Firebase Console (punca
// ralat "query requires an index" yang dilaporkan). Susun di klien elak
// keperluan tu SEPENUHNYA - tak perlu buat apa-apa di Firebase Console.
export function useKkgsYuranTahun(tahun, aktif = true) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun || !aktif) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahun)))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (b.tarikh ?? '').localeCompare(a.tarikh ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [tahun, aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export function useKkgsYuranAhli(ahliId) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !ahliId) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('ahliId', '==', ahliId))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (b.tarikh ?? '').localeCompare(a.tarikh ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [ahliId])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahYuranKkgs({ ahliId, ahliNama, tarikh, jumlah, catatan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const tahun = Number(tarikh.slice(0, 4)) // tahun DIAMBIL dari tarikh bayaran - pastikan peruntukan bulan kira tahun BETUL
  await addDoc(collection(db, KOLEKSI), {
    ahliId, ahliNama, tarikh, tahun, jumlah: Number(jumlah), catatan: catatan?.trim() ?? '',
    createdAt: serverTimestamp(), updatedBy: uid,
  })
}

export async function padamYuranKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
