import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

export function useAdminsList() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setAdmins([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'admins'))
      setAdmins(snap.docs.map((d) => ({ emel: d.id, ...d.data() })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { admins, loading, muatSemula }
}

export async function tambahAdmin(emel, tambahOleh) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, 'admins', emel), {
    emel,
    tambahOleh,
    tambahPada: serverTimestamp(),
  })
}

export async function buangAdmin(emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, 'admins', emel))
}
