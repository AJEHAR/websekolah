import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsAhli'

// Senarai Ahli KKGS - ID dokumen AUTO-JANA (bukan berasaskan emel lagi -
// kebenaran KKGS kini guna model admin BIASA (isAdminSeksyen('kkgs') di
// firestore.rules), BUKAN padanan emel dalam senarai ahli. Medan "emel"
// kekal PILIHAN sekadar rujukan/maklumat, tiada kesan fungsi/kebenaran.
export function useKkgsAhliSenarai() {
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

export async function tambahAhliKkgs({ nama, emel, jawatan, statusKeahlian, bulanMula, bulanTamat }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const rujukan = doc(collection(db, KOLEKSI))
  await setDoc(rujukan, {
    nama: nama.trim(), emel: emel?.trim().toLowerCase() ?? '', jawatan: jawatan || 'Ahli', statusKeahlian: statusKeahlian || 'aktif',
    bulanMula: bulanMula ?? 1, bulanTamat: bulanTamat ?? 12,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  })
  return rujukan.id
}

export async function kemaskiniAhliKkgs(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

// Lantikan jawatan SATU ORANG - tanggal pemegang lama + lantik baharu
// dalam SATU batch ATOMIC (fix bug #4) - dulu 2 write berasingan, kalau
// write kedua gagal (rangkaian terputus dll), jawatan jadi KOSONG (orang
// lama tertanggal tapi orang baharu tak sempat dilantik). Batch pastikan
// KEDUA-DUA berjaya, atau KEDUA-DUA gagal (tiada keadaan separuh jalan).
export async function lantikJawatanAtomicKkgs({ idPemegangLama, idBaharu, jawatan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const batch = writeBatch(db)
  if (idPemegangLama && idPemegangLama !== idBaharu) {
    batch.update(doc(db, KOLEKSI, idPemegangLama), { jawatan: 'Ahli', updatedAt: serverTimestamp(), updatedBy: uid })
  }
  if (idBaharu) {
    batch.update(doc(db, KOLEKSI, idBaharu), { jawatan, updatedAt: serverTimestamp(), updatedBy: uid })
  }
  await batch.commit()
}

export async function padamAhliKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Padam PUKAL - had 500 setiap batch (had Firestore sendiri), dipecah
// automatik kalau lebih.
export async function padamAhliPukalKkgs(idSenarai) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const kepingan = []
  for (let i = 0; i < idSenarai.length; i += 450) kepingan.push(idSenarai.slice(i, i + 450))
  for (const keping of kepingan) {
    const batch = writeBatch(db)
    keping.forEach((id) => batch.delete(doc(db, KOLEKSI, id)))
    await batch.commit()
  }
}

// Kemaskini PUKAL - untuk tetapkan Bulan Mula/Tamat (atau medan lain)
// kepada BERBILANG ahli serentak (cth. semua ahli baharu sertai Jun).
export async function kemaskiniAhliPukalKkgs(idSenarai, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const kepingan = []
  for (let i = 0; i < idSenarai.length; i += 450) kepingan.push(idSenarai.slice(i, i + 450))
  for (const keping of kepingan) {
    const batch = writeBatch(db)
    keping.forEach((id) => batch.update(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid }))
    await batch.commit()
  }
}

// Import pukal nama sahaja (ringkas) - ahli baharu semua lalai
// jawatan="Ahli", statusKeahlian="aktif", bulanMula=1, bulanTamat=12.
// Nama pendua (dengan ahli sedia ada) dilangkau, bukan cipta rekod
// kembar.
export async function importNamaPukalKkgs(senaraiNama, senaraiSediaAda, uid) {
  const namaSediaAda = new Set(senaraiSediaAda.map((a) => a.nama.trim().toLowerCase()))
  let ditambah = 0
  let dilangkau = 0
  for (const nama of senaraiNama) {
    const namaBersih = nama.trim()
    if (!namaBersih) continue
    if (namaSediaAda.has(namaBersih.toLowerCase())) {
      dilangkau += 1
      continue
    }
    const rujukan = doc(collection(db, KOLEKSI))
    await setDoc(rujukan, {
      nama: namaBersih, emel: '', jawatan: 'Ahli', statusKeahlian: 'aktif', bulanMula: 1, bulanTamat: 12,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
    })
    namaSediaAda.add(namaBersih.toLowerCase())
    ditambah += 1
  }
  return { ditambah, dilangkau }
}
