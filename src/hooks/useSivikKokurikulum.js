import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

const KOLEKSI = 'sivikKokurikulum'

// Senarai Tajuk Sivik Dalam Kokurikulum RASMI - AUTO-SEDIA sekali sahaja
// bila koleksi kosong. Admin boleh tambah/edit/padam lepas ni. AI Laporan
// UBKS pilih 2 TAJUK paling sesuai dari senarai ni (bukan jana bebas -
// lihat perbincangan reka bentuk).
const SIVIK_LALAI = [
  // Kasih Sayang
  ['Kasih Sayang', 'Fizikal Cergas Mental Sihat', 'Keterampilan diri'],
  ['Kasih Sayang', 'Belas Kasihan Dalam Keluarga', 'Bercerita; Simulasi'],
  ['Kasih Sayang', 'Sekolah Bebas Buli', 'Tayangan multimedia berkaitan disiplin dan kerohanian'],
  ['Kasih Sayang', 'Masyarakat Penyayang Merentasi Kaum dan Etnik', 'Permainan Dinamika; Gotong-royong'],
  ['Kasih Sayang', 'Jimat Air dan Elektrik', 'Mencipta dan memasang notis peringatan; Aktiviti 3R'],
  ['Kasih Sayang', 'Sayangi Flora dan Fauna', 'Aktiviti 3K; Kebun sekolah; Sayangi sungai kita'],
  ['Kasih Sayang', 'Sayangi Sesama Insan', 'Nyanyian lagu bertema kasih sayang; Mencipta kad ucapan'],
  ['Kasih Sayang', 'Pemupukan Jati Diri', 'Pengucapan awam; Cipta cogan kata'],
  ['Kasih Sayang', 'Rukun Negara', 'Menghayati rukun negara'],
  ['Kasih Sayang', 'Warisan dan Budaya Malaysia', 'Persembahan kebudayaan Malaysia'],
  ['Kasih Sayang', 'Sistem Raja Berlembagaan', 'Mencipta buku skrap'],
  ['Kasih Sayang', 'Cintai Malaysia', 'Nyanyian lagu patriotik'],
  // Hormat-Menghormati
  ['Hormat-Menghormati', 'Hak Aku dan Dia untuk Tidak Disentuh', 'Tayangan multimedia; Ceramah'],
  ['Hormat-Menghormati', 'Hormati Keluarga', 'Sistem panggilan dalam keluarga (semua keturunan kaum)'],
  ['Hormat-Menghormati', 'Menghargai Golongan Orang Kurang Upaya (OKU)', 'Mengenali simbol dan kemudahan untuk Murid Berkeperluan Khas (MBK)'],
  ['Hormat-Menghormati', 'Hormati Warga Sekolah', 'Mengenal warga sekolah (Pengurusan dan lain-lain)'],
  ['Hormat-Menghormati', 'Malu Melakukan Perkara Negatif', 'Tayangan multimedia; Ceramah'],
  ['Hormat-Menghormati', 'Hormat Kepelbagaian Agama, Budaya dan Etnik Di Malaysia', 'Pertunjukan fesyen pakaian tradisional Malaysia; Tayangan multimedia'],
  ['Hormat-Menghormati', 'Mematuhi Undang-Undang Jalan Raya', 'Simulasi (situasi kehidupan harian); Mengenal maksud papan tanda di sekitar sekolah'],
  ['Hormat-Menghormati', 'Menghormati Undang-Undang Negara Lain', 'Bercerita tentang negara luar yang pernah dilawati'],
  ['Hormat-Menghormati', 'Toleransi', 'Ceramah'],
  ['Hormat-Menghormati', 'Jauhi Rasuah', 'Tayangan multimedia'],
  ['Hormat-Menghormati', 'Amalan 3R', 'Gotong-royong'],
  ['Hormat-Menghormati', 'Dunia Aman', 'Pengucapan awam'],
  // Bertanggungjawab
  ['Bertanggungjawab', 'Celik Wang', 'Keusahawanan; Bijak wang; Permainan Saidina dan setara; Kenal mata wang dunia'],
  ['Bertanggungjawab', 'Patuhi Peraturan dan Undang-Undang Dalam Negara', 'Simulasi keselamatan jalan raya'],
  ['Bertanggungjawab', 'Peranti (Gajet Mania)', 'Penggunaan gajet berhemah'],
  ['Bertanggungjawab', 'Rajin dan Komited', 'Permainan dinamika'],
  ['Bertanggungjawab', 'Benci Rasuah', 'Simulasi'],
  ['Bertanggungjawab', 'Sekolahku Rumahku', 'Gotong-royong'],
  ['Bertanggungjawab', 'Hak Kanak-Kanak', 'Pengucapan awam; Persembahan nyanyian; Pertunjukan bakat'],
  ['Bertanggungjawab', 'Jujur dan Amanah', 'Simulasi (berkaitan kehidupan harian)'],
  ['Bertanggungjawab', 'Tepati Janji dan Masa', 'Permainan dinamika'],
  ['Bertanggungjawab', 'Kata Tidak Pada Rokok, Inhalan dan Dadah', 'Pengucapan awam; Nyanyian lagu berkaitan kesihatan; Melukis poster'],
  ['Bertanggungjawab', 'Celik Cukai', 'Tayangan multimedia'],
  ['Bertanggungjawab', 'Buli Siber', 'Simulasi; Tayangan multimedia'],
  // Kegembiraan
  ['Kegembiraan', 'Fikirkan Boleh', 'Tayangan multimedia; Nyanyian lagu-lagu patriotik dan kerohanian'],
  ['Kegembiraan', 'Keluarga Bahagia Masyarakat Sejahtera', 'Cipta kad ucapan; Cipta brosur; Melukis poster'],
  ['Kegembiraan', 'Pengaruh Rakan Sebaya', 'Peer buddy; Cipta kad ucapan untuk BFF'],
  ['Kegembiraan', 'Interaksi Sihat Antara Rakan, Keluarga dan Masyarakat', 'Permainan teka-teki; Permainan bahasa bertema'],
  ['Kegembiraan', 'Rakan Baik Selamanya Daripada Pelbagai Kaum', 'Menulis surat kepada rakan; Mencipta "Friendship Bracelet"'],
  ['Kegembiraan', 'Menghargai Pemimpin', "Membuat topeng 'wajah-wajah perwira'; Bercerita tentang tokoh kepimpinan"],
  ['Kegembiraan', 'Semangat Patriotik', 'Menyanyikan lagu patriotik; Simulasi patriotik'],
  ['Kegembiraan', 'Berterima Kasih', "Aktiviti 'Suara Malaysia'"],
]

export function useSivikKokurikulum() {
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
        for (const [nilai, tajuk, aktiviti] of SIVIK_LALAI) {
          await addDoc(collection(db, KOLEKSI), { nilai, tajuk, aktiviti, createdAt: serverTimestamp() })
        }
        snap = await getDocs(collection(db, KOLEKSI))
      }
      const semua = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      semua.sort((a, b) => (a.nilai + a.tajuk).localeCompare(b.nilai + b.tajuk))
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

export async function tambahSivik(nilai, tajuk, aktiviti) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await addDoc(collection(db, KOLEKSI), { nilai, tajuk, aktiviti, createdAt: serverTimestamp() })
}

export async function kemaskiniSivik(id, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await updateDoc(doc(db, KOLEKSI, id), data)
}

export async function padamSivik(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase belum disetup')
  await deleteDoc(doc(db, KOLEKSI, id))
}
