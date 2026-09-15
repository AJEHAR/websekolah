import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

const KOLEKSI = 'kkgsAhli'

// Senarai Ahli KKGS - ID DOKUMEN = emel ahli (dinormalkan, sama corak
// dengan koleksi admins/) - PENTING supaya firestore.rules boleh SEMAK
// TERUS (get() satu dokumen) sama ada pengguna semasa Jawatankuasa,
// tanpa perlu query - lihat isJawatankuasaKKGS() dalam firestore.rules.
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

export async function tambahAhliKkgs({ nama, emel, jawatan, statusKeahlian }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const docId = emel ? emelKeDocId(emel) : doc(collection(db, KOLEKSI)).id
  const rujukan = doc(db, KOLEKSI, docId)
  const sediaAda = await getDoc(rujukan)
  if (sediaAda.exists()) throw new Error('Ahli dengan emel ni dah wujud dalam senarai.')
  await setDoc(rujukan, {
    nama: nama.trim(), emel: emel?.trim().toLowerCase() ?? '', jawatan: jawatan || 'Ahli', statusKeahlian: statusKeahlian || 'aktif',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  })
  return docId
}

export async function kemaskiniAhliKkgs(id, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), { ...data, updatedAt: serverTimestamp(), updatedBy: uid })
}

export async function padamAhliKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}

// Import pukal nama sahaja (ringkas, ikut keputusan pengguna) - ahli
// baharu semua lalai jawatan="Ahli" & statusKeahlian="aktif", TIADA emel
// (staff isi emel/jawatan satu-satu kemudian dalam borang edit - tanpa
// emel, akaun tu TAK dapat kelayakan Jawatankuasa automatik walau
// jawatan ditukar, sehingga emel diisi). Nama pendua (dengan ahli sedia
// ada) dilangkau, bukan cipta rekod kembar.
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
      nama: namaBersih, emel: '', jawatan: 'Ahli', statusKeahlian: 'aktif',
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
    })
    namaSediaAda.add(namaBersih.toLowerCase())
    ditambah += 1
  }
  return { ditambah, dilangkau }
}
