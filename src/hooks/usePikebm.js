import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'pikebmUBKS'

// 20 aktiviti PIKeBM rasmi - AUTO-SEDIA sekali sahaja bila koleksi kosong
// (staff pertama buka Laporan UBKS, tak perlu admin sediakan manual dulu).
// Admin boleh tambah/edit/padam lepas ni di Panel Urus PIKeBM.
const PIKEBM_LALAI = [
  ['Akhbar Pembuka Minda', 'Membaca dan memahami teks serta memberi ulasan.'],
  ['Akulah Jaguh', 'Menjawab dengan ayat yang lengkap dan dapat memberi pendapat tentang sukan.'],
  ['Bina Kata', 'Membina perkataan daripada tema yang diberikan.'],
  ['Bisik-bisik Sayang', 'Mendengar dan bertutur dengan ayat yang betul.'],
  ['Burung Tiung', 'Menyampaikan arahan kawad secara spontan.'],
  ['Cakna Mata', 'Mengenal pasti kesalahan sepertibahasa dan slogan daripada pelbagai sumber dan memurnikannya.'],
  ['Cef Cilik', 'Menyampaikan maklumat dan menerangkan sesuatu proses dengan jelas menggunakan ayat yang mudah.'],
  ['Cuit-cuit Fikir', 'Meneka perkataan berdasarkan aksi yang ditunjukkan; dan membina ayat mudah berdasarkan perkataan.'],
  ['DJ Hatiku', 'Bertutur dan berinteraksi secara berhemah serta menyampaikan maklumat secara berkesan dan betul.'],
  ['Fikir-fikirkan', 'Membina ayat mudah yang bermakna dan memperluas ayat menggunakan perkataan yang bermakna.'],
  ['Getaran Bahasa', 'Mengukuhkan kosa kata, membentuk perkataan daripada aktiviti yang dilaksanakan dan membina ayat mudah.'],
  ['Jualan Langsung', 'Bercerita berdasarkan bahan yang diberikan dengan menggunakan sebutan dan perkataan yang betul dan tepat.'],
  ['Madah Berirama', 'Menyebut dan melafazkan puisi seperti pantun, sajak dan syair dengan sebutan dan intonasi yang betul serta memahami maksud puisi.'],
  ['Pentas Aksi', 'Melakonkan watak secara spontan dan bertatasusila mengikut konteks serta memberikan komen dan mempertahankan idea yang diberikan.'],
  ['Pintar Bahasa', 'Menyampaikan arahan menggunakan laras bahasa yang sesuai dan berinteraksi secara dua hala dengan jelas.'],
  ['Sahutlah Panggilanku', 'Menyambung frasa berdasarkan soalan yang diberikan dan menyanyikan lagu yang dicipta sendiri.'],
  ['Teka Kata Pilihan', 'Memperkasakan penguasaan kosa kata dalam pelbagai disiplin ilmu dan membina ayat mudah daripada perkataan yang diberikan.'],
  ['Telefon Cikgu', 'Mendengar dan menyebut bunyi alam dengan telitinya dan membina ayat mudah berdasarkan bunyi yang didengar.'],
  ['Tiga Perkataan Sahaja', 'Menyampaikan ayat mudah secara spontan dan menjawab soalan menggunakan tiga perkataan sahaja.'],
  ['Sorak Berentak', 'Menyanyikan lagu mengikut melodi yang betul dan mencipta lirik lagu yang bermakna.'],
]

export function usePikebm() {
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
      let snap = await getDocs(collection(db, KOLEKSI))
      if (snap.empty) {
        for (const [tajuk, objektif] of PIKEBM_LALAI) {
          await addDoc(collection(db, KOLEKSI), { tajuk, objektif, createdAt: serverTimestamp() })
        }
        snap = await getDocs(collection(db, KOLEKSI))
      }
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.tajuk ?? '').localeCompare(b.tajuk ?? ''))
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

export async function tambahPikebm(tajuk, objektif) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { tajuk, objektif, createdAt: serverTimestamp() })
}

export async function kemaskiniPikebm(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), data)
}

export async function padamPikebm(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
