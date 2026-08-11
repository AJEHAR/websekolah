import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kehadiranUBKS'

function idRekod(tahunSesi, unitId, perjumpaan) {
  return `${tahunSesi}_${unitId}_${perjumpaan}`
}

// Semua rekod kehadiran UBKS untuk satu tahun sesi (semua unit, semua perjumpaan)
export function useKehadiranUBKSTahun(tahunSesi) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahunSesi) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahunSesi', '==', String(tahunSesi)))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [tahunSesi])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// senaraiKehadiran: [{ idMurid, nama, hadir: bool, adalahLF: bool }, ...]
export async function simpanKehadiranUBKS(tahunSesi, unit, perjumpaan, tarikh, senaraiKehadiran, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const jumlahAhli = senaraiKehadiran.length
  const jumlahHadir = senaraiKehadiran.filter((m) => m.hadir).length

  const ref = doc(db, KOLEKSI, idRekod(tahunSesi, unit.id, perjumpaan))
  await setDoc(ref, {
    tahunSesi: String(tahunSesi),
    unitId: unit.id,
    namaUnit: unit.namaUnit,
    kategoriUnit: unit.kategoriUnit ?? null,
    perjumpaan,
    tarikh,
    senaraiKehadiran,
    jumlahAhli,
    jumlahHadir,
    jumlahTakHadir: jumlahAhli - jumlahHadir,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  })
}
