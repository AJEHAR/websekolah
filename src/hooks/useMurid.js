import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'murid'
const SAIZ_KELOMPOK = 400 // had Firestore batch = 500, guna 400 untuk selamat

export function useMuridList() {
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
      semua.sort((a, b) => (a.nama ?? '').localeCompare(b.nama ?? ''))
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

// GANTI SEPENUHNYA - sinkronkan koleksi 'murid' dengan fail Excel terkini:
// - Murid dalam fail -> ditambah (baru) atau ditulis ganti (sedia ada, BUKAN merge)
// - Murid TIADA dalam fail -> DIPADAM (sebab fail ni snapshot penuh sekolah)
// Pulangkan { ditambahKemaskini, dipadam }.
export async function gantiSemuaMurid(senaraiMurid, uid, onProgress) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')

  const snapSediaAda = await getDocs(collection(db, KOLEKSI))
  const idSediaAda = snapSediaAda.docs.map((d) => d.id)
  const idBaruSet = new Set(senaraiMurid.map((m) => m.idMurid))
  const idUntukPadam = idSediaAda.filter((id) => !idBaruSet.has(id))

  const jumlahKeseluruhan = senaraiMurid.length + idUntukPadam.length
  let selesai = 0

  for (let i = 0; i < idUntukPadam.length; i += SAIZ_KELOMPOK) {
    const kumpulan = idUntukPadam.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((id) => batch.delete(doc(db, KOLEKSI, id)))
    await batch.commit()
    selesai += kumpulan.length
    onProgress?.(selesai, jumlahKeseluruhan)
  }

  for (let i = 0; i < senaraiMurid.length; i += SAIZ_KELOMPOK) {
    const kumpulan = senaraiMurid.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((m) => {
      const ref = doc(db, KOLEKSI, m.idMurid)
      // TIADA { merge: true } - set() biasa GANTI SEPENUHNYA dokumen tu
      batch.set(ref, { ...m, updatedAt: serverTimestamp(), updatedBy: uid })
    })
    await batch.commit()
    selesai += kumpulan.length
    onProgress?.(selesai, jumlahKeseluruhan)
  }

  return { ditambahKemaskini: senaraiMurid.length, dipadam: idUntukPadam.length }
}
