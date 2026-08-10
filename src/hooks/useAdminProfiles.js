import { doc, deleteDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

// Admin cipta profile baru (pra-daftar) ATAU kemas kini profile sedia ada.
// emel jadi ID dokumen supaya bila staff log masuk kali pertama, ia auto padan.
// Profile yang admin sentuh (cipta/edit) automatik "diluluskan" - admin dah vet.
export async function simpanProfileAdmin(emel, data, adminUid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, 'profiles', emelKeDocId(emel))
  const snap = await getDoc(ref)
  const sediaAda = snap.exists() ? {} : { createdAt: serverTimestamp(), createdBy: adminUid }
  await setDoc(
    ref,
    { ...data, emel, status: 'diluluskan', updatedAt: serverTimestamp(), ...sediaAda },
    { merge: true }
  )
}

// Kelulusan untuk profile yang staff self-register
export async function luluskanProfile(emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, 'profiles', emelKeDocId(emel)), { status: 'diluluskan', updatedAt: serverTimestamp() }, { merge: true })
}

export async function padamProfileAdmin(emel) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, 'profiles', emelKeDocId(emel)))
}
