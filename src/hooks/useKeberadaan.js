import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kehadiran'

export async function tambahKeberadaan(data, user) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    ...data,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    updatedAt: serverTimestamp(),
  })
}

export async function kemaskiniKeberadaan(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp() })
}

export async function padamKeberadaan(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

export async function muatNaikDokumen(fail, emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const path = `kehadiran/${emel}-${Date.now()}-${fail.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, fail)
  const url = await getDownloadURL(storageRef)
  return { url, nama: fail.name }
}

// Rekod yang aktif pada satu tarikh (tarikhMula <= tarikh <= tarikhTamat)
// Guna untuk "Keberadaan Hari Ini" dan "Keberadaan Esok"
export function useKeberadaanTarikh(tarikh) {
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
      const q = query(collection(db, KOLEKSI), where('tarikhMula', '<=', tarikh))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setSenarai(semua.filter((r) => r.tarikhTamat >= tarikh))
    } finally {
      setLoading(false)
    }
  }, [tarikh])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Rekod bertindih dengan julat [dari, hingga] - untuk Log Keberadaan
export function useLogKeberadaan(dari, hingga, aktif) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(false)

  const muatSemula = useCallback(async () => {
    if (!aktif || !dari || !hingga || !isFirebaseConfigured) return
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tarikhMula', '<=', hingga))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const hasil = semua.filter((r) => r.tarikhTamat >= dari)
      hasil.sort((a, b) => (a.tarikhMula < b.tarikhMula ? 1 : -1))
      setSenarai(hasil)
    } finally {
      setLoading(false)
    }
  }, [dari, hingga, aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// Semua rekod untuk satu staff - untuk "Senarai Keberadaan" di Profile page
export function useKeberadaanSaya(emel) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!emel || !isFirebaseConfigured) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('profilEmel', '==', emel))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.tarikhMula < b.tarikhMula ? 1 : -1))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [emel])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}
