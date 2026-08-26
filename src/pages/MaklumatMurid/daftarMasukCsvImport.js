import { uraiCSVBaris } from '../../lib/csvUtils.js'

// Lajur CSV yang dikenali (header -> kunci medan) - padan header sebenar
// Buku Daftar sekolah (BILANGAN, TARIKH MASUK, NAMA, JANTINA, dst).
const PEMETAAN_LAJUR = {
  'BILANGAN': 'bilangan',
  'BIL': 'bilangan',
  'BIL.': 'bilangan',
  'ID MURID': 'idMurid', // padanan pilihan sahaja - lihat nota di bawah
  'TARIKH MASUK': 'tarikhMasuk',
  'NAMA': 'nama',
  'JANTINA': 'jantina',
  'BANGSA': 'bangsa',
  'AGAMA': 'agama',
  'NO KAD PENGENALAN': 'noPengenalan',
  'NO. KAD PENGENALAN': 'noPengenalan',
  'TARIKH DIPERANAKKAN': 'tarikhLahir',
  'BILANGAN SURAT BERANAK': 'bilanganSuratBeranak',
  'TEMPAT DIPERANAKKAN': 'tempatDiperanakkan',
  'DARJAH': 'darjah',
  'NO KEBENARAN': 'noKebenaran',
  'NO. KEBENARAN': 'noKebenaran',
  'NAMA PENJAGA': 'namaPenjaga',
  'PERSAUDARAAN': 'persaudaraan',
  'PEKERJAAN': 'pekerjaan',
  'ALAMAT': 'alamat',
  'SEKOLAH DAHULU': 'sekolahDahulu',
  // TARIKH KELUAR / LULUS DARJAH / SEBAB MENINGGALKAN SEKOLAH SENGAJA tak
  // dipetakan di sini - medan tu untuk "Daftar Keluar Murid"/Sijil Tamat,
  // bukan Daftar Masuk (kalau ada dalam fail sama, ia akan tersenarai
  // sebagai "lajur tak dikenali", itu memang betul/dijangka).
}

// Baca fail CSV Daftar Masuk Murid (data lama) - SEMUA baris DIIMPORT
// terus sebagai SNAPSHOT (bukan wajib padan dengan rekod Murid semasa -
// ramai rekod BUKU DAFTAR lama melibatkan murid yang DAH TAMAT/keluar
// sekolah, jadi tiada dalam senarai Murid aktif langsung). Padanan
// (ikut ID MURID/No.KP) cuma BONUS pautan rujukan kalau kebetulan jumpa,
// bukan syarat.
export async function baiFailDaftarMasukCsv(fail, senaraiMurid) {
  const teks = await fail.text()
  const semuaBaris = uraiCSVBaris(teks)

  if (semuaBaris.length === 0) {
    throw new Error('Fail CSV kosong.')
  }

  const headerBaris = semuaBaris[0].map((h) => String(h ?? '').trim().toUpperCase())
  const barisData = semuaBaris.slice(1)
  const lajurTakDikenali = headerBaris.filter((h) => h && !PEMETAAN_LAJUR[h])

  const idById = new Map(senaraiMurid.map((m) => [m.id, m]))
  const idByNoPengenalan = new Map(senaraiMurid.filter((m) => m.noPengenalan).map((m) => [m.noPengenalan, m]))

  const hasil = barisData.map((baris, i) => {
    const data = {}
    headerBaris.forEach((h, idx) => {
      const kunci = PEMETAAN_LAJUR[h]
      if (!kunci || kunci === 'idMurid') return
      const nilai = baris[idx]
      data[kunci] = nilai == null ? '' : String(nilai).trim()
    })

    const idMuridMentah = headerBaris.includes('ID MURID') ? String(baris[headerBaris.indexOf('ID MURID')] ?? '').trim() : ''
    let murid = null
    if (idMuridMentah && idById.has(idMuridMentah)) murid = idById.get(idMuridMentah)
    else if (data.noPengenalan && idByNoPengenalan.has(data.noPengenalan)) murid = idByNoPengenalan.get(data.noPengenalan)

    return {
      barisKe: i + 2,
      sepadan: Boolean(murid),
      data: { ...data, muridId: murid?.id ?? null },
    }
  })

  return { hasil, lajurTakDikenali }
}
