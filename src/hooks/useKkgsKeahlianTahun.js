import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'kkgsKeahlianTahun'

// Papan Yuran PER TAHUN - dokumen di sini = ahli tu DISERTAKAN dalam
// papan pembayaran tahun berkenaan (bukan lagi automatik ikut Senarai
// Ahli semasa). TIADA dokumen = TAK muncul dalam papan tahun tu langsung.
// Ni fix keluhan sebenar: ahli yang dah bersara/pindah masih "melekat"
// dalam papan tahun BAHARU (2027) walaupun status dia dah bukan aktif
// sejak 2026 - sebab dulu papan tarik terus dari Senarai Ahli induk tanpa
// mengira tahun.
//
// bulanMula/bulanTamat pada dokumen ni ialah TEMPOH bayar ahli tu untuk
// tahun berkenaan SAHAJA - null/tiada = lalai (1 hingga bilangan bulan
// tetapan tahun tu, ikut tetapan SEMASA - jadi kalau tetapan tahun tu
// diubah kemudian, ahli "penuh tahun" ikut sama automatik).
//
// ID dokumen guna corak `${ahliId}_${tahun}` - senang setDoc/deleteDoc
// terus tanpa query dulu.
function idDoc(ahliId, tahun) {
  return `${ahliId}_${tahun}`
}

export function useKkgsKeahlianTahunSenarai(tahun) {
  const [peta, setPeta] = useState({})
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun) {
      setPeta({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahun)))
      const snap = await getDocs(q)
      const petaBaru = {}
      snap.docs.forEach((d) => {
        const data = d.data()
        petaBaru[data.ahliId] = { bulanMula: data.bulanMula ?? 1, bulanTamat: data.bulanTamat ?? null }
      })
      setPeta(petaBaru)
    } finally {
      setLoading(false)
    }
  }, [tahun])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { peta, loading, muatSemula }
}

// Tambah SATU ahli ke papan tahun ni (atau kemaskini tempoh dia kalau
// dah ada) - bulanTamat: null bermaksud "penuh tahun ikut tetapan".
export async function simpanKeahlianTahun(ahliId, tahun, { bulanMula, bulanTamat }, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await setDoc(doc(db, KOLEKSI, idDoc(ahliId, tahun)), {
    ahliId, tahun: Number(tahun), bulanMula: bulanMula ?? 1, bulanTamat: bulanTamat ?? null,
    updatedAt: serverTimestamp(), updatedBy: uid,
  })
}

// Keluarkan SATU ahli dari papan tahun ni sepenuhnya (bukan sekadar
// reset tempoh - guna simpanKeahlianTahun({bulanMula:1,bulanTamat:null})
// untuk tu). Rekod BAYARAN lama ahli tu (kkgsYuran) TIDAK terjejas -
// cuma tak dipaparkan dalam papan tahun ni je.
export async function buangDariRosterTahun(ahliId, tahun) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, idDoc(ahliId, tahun)))
}

// Kemaskini PUKAL keahlian papan tahun - tambah (dengan tempoh lalai
// penuh tahun) & buang serentak, ikut pilihan checkbox dari ModalRoster.
// Had 450 setiap batch (had Firestore) - dipecah automatik kalau lebih.
export async function simpanRosterPukal({ tambah, buang }, tahun, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const kerja = [
    ...tambah.map((ahliId) => ({ jenis: 'tambah', ahliId })),
    ...buang.map((ahliId) => ({ jenis: 'buang', ahliId })),
  ]
  for (let i = 0; i < kerja.length; i += 450) {
    const keping = kerja.slice(i, i + 450)
    const batch = writeBatch(db)
    keping.forEach(({ jenis, ahliId }) => {
      const rujukan = doc(db, KOLEKSI, idDoc(ahliId, tahun))
      if (jenis === 'tambah') {
        batch.set(rujukan, { ahliId, tahun: Number(tahun), bulanMula: 1, bulanTamat: null, updatedAt: serverTimestamp(), updatedBy: uid })
      } else {
        batch.delete(rujukan)
      }
    })
    await batch.commit()
  }
}

// Sediakan papan tahun BAHARU dengan SALIN roster tahun sebelumnya -
// HANYA ahli yang statusKeahlian SEMASA dia masih "aktif" yang disalin
// (ahli dah bersara/pindah/berhenti sejak tu automatik TAK disalin -
// ni punca sebenar keluhan "nama lama masih melekat"). Pulangkan
// bilangan disalin (0 kalau tahun sebelumnya tiada roster - staff patut
// guna pilihan lain, cth. isiRosterAktifSemasa).
// SEMUA fungsi "isi roster" di bawah ni SELAMAT dipanggil berulang kali -
// ahli yang DAH ADA dokumen (peta sediaAda) dilangkau, tak ditimpa (elak
// hilang Tempoh Khas yang admin dah tetapkan secara manual sebelum ni).
export async function salinRosterTahunLepas(tahunSumber, tahunSasaran, senaraiAhli, petaSediaAda, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const q = query(collection(db, KOLEKSI), where('tahun', '==', Number(tahunSumber)))
  const snap = await getDocs(q)
  const petaAhli = {}
  senaraiAhli.forEach((a) => { petaAhli[a.id] = a })
  let disalin = 0
  for (const d of snap.docs) {
    const data = d.data()
    if (petaSediaAda[data.ahliId]) continue // dah ada dalam tahun sasaran - jangan timpa
    const ahli = petaAhli[data.ahliId]
    if (!ahli || ahli.statusKeahlian !== 'aktif') continue // dah bersara/pindah/berhenti - jangan salin
    await simpanKeahlianTahun(data.ahliId, tahunSasaran, { bulanMula: 1, bulanTamat: null }, uid)
    disalin += 1
  }
  return { disalin }
}

// Isi papan tahun dengan SEMUA ahli AKTIF semasa dari Senarai Ahli -
// untuk sediakan tahun BAHARU buat kali pertama (takde roster tahun
// sebelumnya untuk disalin).
export async function isiRosterAktifSemasa(tahun, senaraiAhli, petaSediaAda, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const aktif = senaraiAhli.filter((a) => a.statusKeahlian === 'aktif' && !petaSediaAda[a.id])
  for (const a of aktif) {
    await simpanKeahlianTahun(a.id, tahun, { bulanMula: 1, bulanTamat: null }, uid)
  }
  return { disertakan: aktif.length }
}

// Isi papan tahun dengan SEMUA ahli dalam Senarai Ahli TANPA kira status
// - untuk migrasi SEKALI SAHAJA bagi tahun yang DAH ADA rekod bayaran
// sebelum ciri roster ni wujud (cth. tahun semasa sistem pertama kali
// naik taraf) - elak kehilangan rekod ahli yang dah bersara/pindah
// PERTENGAHAN tahun tu (dia masih patut kelihatan untuk tahun tu,
// sejarah bayaran dia sendiri).
export async function isiRosterSemuaAhli(tahun, senaraiAhli, petaSediaAda, uid) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  const belumAda = senaraiAhli.filter((a) => !petaSediaAda[a.id])
  for (const a of belumAda) {
    await simpanKeahlianTahun(a.id, tahun, { bulanMula: 1, bulanTamat: null }, uid)
  }
  return { disertakan: belumAda.length }
}
