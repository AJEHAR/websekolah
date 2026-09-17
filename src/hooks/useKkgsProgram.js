import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsProgram'

// Program/Aktiviti KKGS - SATU dokumen setiap program, medan "tahun"
// (nombor, cth 2026) DIAMBIL dari tarikh program semasa simpan - sama
// corak macam useKkgsYuran.js (bukan medan diisi manual, elak tersasar
// dari tarikh sebenar).
//
// PENTING: susun (sort) tarikh dibuat di KLIEN (bukan orderBy() dalam
// query Firestore) - gabungan where()+orderBy() pada medan berbeza
// perlukan indeks komposit khas - sama sebab macam useKkgsYuran.js.
export function useKkgsProgramTahun(tahun) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahun)))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.tarikh ?? '').localeCompare(b.tarikh ?? ''))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [tahun])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function tambahProgramKkgs({ nama, tarikh, catatan, status }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const tahun = Number(tarikh.slice(0, 4)) // tahun DIAMBIL dari tarikh - pastikan filter tahun sentiasa tepat
  await addDoc(collection(db, KOLEKSI), {
    nama: nama.trim(), tarikh, tahun, catatan: catatan?.trim() ?? '', status: status || 'akan-datang',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

export async function kemaskiniProgramKkgs(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const kemaskini = { ...data }
  if (kemaskini.tarikh) kemaskini.tahun = Number(kemaskini.tarikh.slice(0, 4)) // tahun ikut tarikh SETIAP KALI tarikh diubah
  await updateDoc(doc(db, KOLEKSI, id), { ...kemaskini, updatedAt: serverTimestamp(), updatedBy: uid })
}

// Tukar status pantas (Selesai/Tangguh) tanpa buka borang penuh - guna
// dari butang terus dalam senarai.
export async function tukarStatusProgramKkgs(id, status, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { status, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamProgramKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
