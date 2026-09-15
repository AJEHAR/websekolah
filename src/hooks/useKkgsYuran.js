import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsYuran'

// Log bayaran yuran - SATU dokumen SETIAP bayaran (bukan satu dokumen
// setiap ahli) - senang kira jumlah terkumpul (jumlahkan semua rekod
// ahli tu) tanpa perlu risau format "bulan mana dah bayar" yang berbeza
// ikut cara KKGS urus (bulanan/tahunan/lain) - fleksibel untuk apa jua
// kekerapan bayaran sekolah amalkan. Medan "tahun" (nombor, cth 2026)
// PENTING - kira peruntukan bulan HANYA guna bayaran tahun berkenaan
// (elak bayaran lebih tahun lepas "terbawa" masuk kiraan tahun semasa).
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
      const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahun)), orderBy('tarikh', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tahun, aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// PENTING: untuk staff BUKAN Jawatankuasa - peraturan Firestore TOLAK
// query TANPA penapis ahliId (tak boleh "buktikan" setiap dokumen hasil
// query patuh peraturan baca). Query ni TAPIS di PERINGKAT QUERY (bukan
// klien) - satu-satunya cara staff biasa boleh baca rekod SENDIRI sahaja
// tanpa ralat kebenaran.
export function useKkgsYuranAhliTahun(ahliId, tahun) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !ahliId || !tahun) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('ahliId', '==', ahliId), where('tahun', '==', Number(tahun)), orderBy('tarikh', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [ahliId, tahun])

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
      const q = query(collection(db, KOLEKSI), where('ahliId', '==', ahliId), orderBy('tarikh', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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
