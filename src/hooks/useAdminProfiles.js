import { doc, deleteDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

// Admin cipta profile baru (pra-daftar) ATAU kemas kini profile sedia ada.
// emel jadi ID dokumen supaya bila staff log masuk kali pertama, ia auto padan.
export async function simpanProfileAdmin(emel, data, adminUid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, 'profiles', emelKeDocId(emel))
  const snap = await getDoc(ref)
  const sediaAda = snap.exists() ? {} : { createdAt: serverTimestamp(), createdBy: adminUid }
  await setDoc(
    ref,
    { ...data, emel, updatedAt: serverTimestamp(), ...sediaAda },
    { merge: true }
  )
}

export async function padamProfileAdmin(emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, 'profiles', emelKeDocId(emel)))
}
