import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsClaim'

// Tuntutan (claim) staff SENDIRI sahaja - untuk mana-mana staff biasa
// (bukan Jawatankuasa) semak status tuntutan dia.
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
      const q = query(collection(db, KOLEKSI), where('pemohonUid', '==', uid), orderBy('tarikhMohon', 'desc'))
      const snap = await getDocs(q)
      setSenarai(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { senarai, loading, muatSemula }
}

// SEMUA tuntutan - HANYA untuk Jawatankuasa semak/luluskan (firestore.rules
// sekat baca rekod orang lain untuk staff biasa - panggilan ni akan gagal
// senyap/pulangkan kosong kalau bukan Jawatankuasa, UI kekal jangan
// panggil fungsi ni melainkan disahkan Jawatankuasa dulu).
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

export async function hantarClaimKkgs({ tujuan, jumlah, resitUrl }, user) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), {
    pemohonUid: user.uid, pemohonNama: user.displayName ?? user.email, pemohonEmel: user.email,
    tujuan: tujuan.trim(), jumlah: Number(jumlah), resitUrl: resitUrl ?? '',
    status: 'menunggu', tarikhMohon: serverTimestamp(), tarikhKeputusan: null, catatanKeputusan: '',
  })
}

export async function putuskanClaimKkgs(id, { status, catatanKeputusan }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), {
    status, catatanKeputusan: catatanKeputusan?.trim() ?? '', tarikhKeputusan: serverTimestamp(), diputuskanOleh: uid,
  })
}
