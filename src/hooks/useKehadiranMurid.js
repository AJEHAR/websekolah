import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { bilanganHariDalamBulan } from '../lib/dateUtils.js'

const KOLEKSI = 'kehadiranMurid'

function idKehadiran(tarikh, namaKelas) {
  return `${tarikh}_${(namaKelas || '').replace(/\//g, '_')}`
}

// Semua rekod kehadiran untuk satu tarikh (satu rekod = satu kelas)
export function useKehadiranTarikh(tarikh) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tarikh) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tarikh', '==', tarikh))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tarikh])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Semua rekod kehadiran dalam julat tarikh (untuk trend bulanan Papan RMT)
export function useKehadiranJulat(dari, hingga) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !dari || !hingga) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tarikh', '>=', dari), where('tarikh', '<=', hingga))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [dari, hingga])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Versi bukan-hook (fungsi biasa) - untuk cetak pukal, tak perlu render React.
export async function ambilKehadiranJulat(dari, hingga) {
  if (!isFirebaseConfigured || !dari || !hingga) return []
  const q = query(collection(db, KOLEKSI), where('tarikh', '>=', dari), where('tarikh', '<=', hingga))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// senaraiMurid: [{ idMurid, nama, hadir: bool, adalahRMT: bool }, ...]
export async function simpanKehadiranKelas(tarikh, namaKelas, senaraiMurid, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')

  const jumlahMurid = senaraiMurid.length
  const jumlahHadir = senaraiMurid.filter((m) => m.hadir).length
  const jumlahTakHadir = jumlahMurid - jumlahHadir
  const peratusKehadiran = jumlahMurid > 0 ? Math.round((jumlahHadir / jumlahMurid) * 100) : 0

  const ref = doc(db, KOLEKSI, idKehadiran(tarikh, namaKelas))
  await setDoc(ref, {
    tarikh,
    namaKelas,
    senaraiMurid,
    jumlahMurid,
    jumlahHadir,
    jumlahTakHadir,
    peratusKehadiran,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}

export async function padamKehadiranKelas(tarikh, namaKelas) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, idKehadiran(tarikh, namaKelas)))
}

// Semua rekod kehadiran untuk satu bulan (semua kelas) - untuk Papan Kehadiran RMT
export function useKehadiranBulan(tahun, bulan) {
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
      const bulanStr = String(bulan).padStart(2, '0')
      const awal = `${tahun}-${bulanStr}-01`
      const akhirHari = bilanganHariDalamBulan(tahun, bulan)
      const akhir = `${tahun}-${bulanStr}-${String(akhirHari).padStart(2, '0')}`
      const q = query(collection(db, KOLEKSI), where('tarikh', '>=', awal), where('tarikh', '<=', akhir))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tahun, bulan])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}
