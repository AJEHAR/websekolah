import { collection, doc, deleteDoc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'laporanUBKS'

// Kunci SAMA corak dengan kehadiranUBKS.js - {tahunSesi}_{unitId}_{perjumpaan}
// - supaya satu perjumpaan = satu rekod Perancangan + satu rekod Kehadiran
// + satu rekod Laporan, semua senang dipautkan/dicari guna kunci sama.
function idRekod(tahunSesi, unitId, perjumpaan) {
  return `${tahunSesi}_${unitId}_${perjumpaan}`
}

// Semua Laporan sedia ada untuk SATU unit (semua 12 perjumpaan sekali) -
// untuk senarai status "ada/tiada laporan" di setiap slot perjumpaan.
export async function senaraiLaporanUnit(tahunSesi, unitId) {
  if (!isFirebaseConfigured) return []
  const q = query(collection(db, KOLEKSI), where('tahunSesi', '==', String(tahunSesi)), where('unitId', '==', unitId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function muatkanLaporanUBKS(tahunSesi, unitId, perjumpaan) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, KOLEKSI, idRekod(tahunSesi, unitId, perjumpaan)))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function simpanLaporanUBKS(tahunSesi, unitId, namaUnit, perjumpaan, data, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const ref = doc(db, KOLEKSI, idRekod(tahunSesi, unitId, perjumpaan))
  await setDoc(ref, {
    ...data,
    tahunSesi: String(tahunSesi), unitId, namaUnit, perjumpaan,
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

export async function padamLaporanUBKS(tahunSesi, unitId, perjumpaan) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, idRekod(tahunSesi, unitId, perjumpaan)))
}
