import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsClaim'

// Tuntutan (claim) staff SENDIRI sahaja - untuk mana-mana staff biasa
// (bukan Jawatankuasa) semak status tuntutan dia.
//
// PENTING: susun (sort) dibuat di KLIEN (bukan orderBy() dalam query) -
// gabungan where()+orderBy() pada MEDAN BERBEZA perlukan "indeks
// komposit" khas dibuat dulu di Firebase Console (sama punca ralat
// "query requires an index" yang berlaku di useKkgsYuranTahun). Susun di
// klien elak keperluan tu sepenuhnya.
export function useKkgsClaimSaya(uid) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('pemohonUid', '==', uid))
      const snap = await getDocs(q)
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (b.tarikhMohon?.toMillis?.() ?? 0) - (a.tarikhMohon?.toMillis?.() ?? 0))
      setSenarai(semua)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// SEMUA tuntutan - kini terbuka kepada SEMUA staff diluluskan (telus,
// atas permintaan pengguna - lihat firestore.rules kkgsClaim).
export function useKkgsClaimSemua(aktif) {
  const [senarai, setSenarai] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !aktif) {
      setSenarai([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), orderBy('tarikhMohon', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

export async function hantarClaimKkgs({ jenisClaim, ahliId, ahliNama, jenisImbuhan, arahSumbangan, kepadaSiapa, tujuan, jumlah, resitUrl, programId, programNama }, user) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    pemohonUid: user.uid, pemohonNama: user.displayName ?? user.email, pemohonEmel: user.email,
    jenisClaim: jenisClaim || 'resit', ahliId: ahliId ?? '', ahliNama: ahliNama ?? '', jenisImbuhan: jenisImbuhan ?? '',
    arahSumbangan: arahSumbangan ?? '', kepadaSiapa: kepadaSiapa ?? '',
    tujuan: (tujuan ?? '').trim(), jumlah: Number(jumlah), resitUrl: resitUrl ?? '',
    programId: programId ?? '', programNama: programNama ?? '',
    status: 'menunggu', tarikhMohon: serverTimestamp(), tarikhKeputusan: null, catatanKeputusan: '',
  })
}

export async function putuskanClaimKkgs(id, { status, catatanKeputusan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), {
    status, catatanKeputusan: catatanKeputusan?.trim() ?? '', tarikhKeputusan: serverTimestamp(), diputuskanOleh: uid,
  })
}

// Edit tuntutan - HANYA dibenarkan (firestore.rules) bila status MASIH
// "menunggu" (belum diputuskan) - elak ubah rekod yang dah termaktub
// dalam Ledger/Kewangan selepas diluluskan (integriti kewangan).
export async function kemaskiniClaimKkgs(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), data)
}

export async function padamClaimKkgs(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
