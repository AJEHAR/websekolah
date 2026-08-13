import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const SAIZ_KELOMPOK = 400 // had Firestore batch = 500, guna 400 untuk selamat

// Padam SEMUA dokumen dalam satu koleksi. Pulangkan bilangan dokumen dipadam.
export async function padamSemuaDalamKoleksi(namaKoleksi) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const snap = await getDocs(collection(db, namaKoleksi))
  const ids = snap.docs.map((d) => d.id)

  for (let i = 0; i < ids.length; i += SAIZ_KELOMPOK) {
    const kumpulan = ids.slice(i, i + SAIZ_KELOMPOK)
    const batch = writeBatch(db)
    kumpulan.forEach((id) => batch.delete(doc(db, namaKoleksi, id)))
    await batch.commit()
  }
  return ids.length
}
