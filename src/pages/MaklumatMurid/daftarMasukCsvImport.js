import { uraiCSVBaris } from '../../lib/csvUtils.js'

// Lajur CSV/Excel yang dikenali (header -> kunci medan) - padan header
// sebenar Buku Daftar sekolah (BILANGAN, TARIKH MASUK, NAMA, JANTINA, dst).
// Dikongsi antara import CSV (daftarMasukCsvImport.js) dan import Excel
// terus (daftarMasukXlsxImport.js) - SATU sumber kebenaran untuk pemetaan.
export const PEMETAAN_LAJUR = {
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
  // TARIKH KELUAR / LULUS DARJAH / SEBAB MENINGGALKAN SEKOLAH DIKENALI
  // (supaya boleh eksport terus dari Excel "BUKU DAFTAR" penuh - 20 lajur -
  // tanpa amaran "lajur tak dikenali"), tapi SENGAJA diabaikan (bukan
  // disimpan) di sini - medan tu untuk "Daftar Keluar Murid"/Sijil Tamat,
  // bukan Daftar Masuk. '_abai' = kunci khas, lihat gelung penguraian di
  // bawah (sama macam 'idMurid', bukan medan data sebenar).
  'TARIKH KELUAR': '_abai',
  'LULUS DARJAH': '_abai',
  'SEBAB MENINGGALKAN SEKOLAH': '_abai',
}

// Kesan format saintifik Excel (cth. "1.40913E+11") pada No. Kad
// Pengenalan - berlaku bila lajur IC dalam Excel SUMBER diformat sebagai
// Nombor/General (bukan Teks) sebelum eksport CSV. Bila ni jadi, DIGIT
// SEBENAR DAH HILANG dalam teks CSV tu sendiri (bukan boleh dipulihkan
// oleh parser) - kena EXPORT SEMULA dari Excel dengan lajur IC diformat
// Teks dulu, ATAU (lebih selamat) muat naik fail .xlsx terus - lihat
// daftarMasukXlsxImport.js, yang terus elak isu ni sepenuhnya sebab baca
// nilai NOMBOR ASAL dari fail Excel, bukan teks yang Excel dah "paparkan".
const POLA_SAINTIFIK = /^\d(\.\d+)?E\+\d+$/i

// Padankan satu baris data (idMurid mentah dari lajur "ID MURID" kalau ada,
// atau noPengenalan) dengan rekod Murid semasa. Dikongsi CSV & Excel import.
export function padankanMurid(data, idMuridMentah, idById, idByNoPengenalan) {
  if (idMuridMentah && idById.has(idMuridMentah)) return idById.get(idMuridMentah)
  if (data.noPengenalan && idByNoPengenalan.has(data.noPengenalan)) return idByNoPengenalan.get(data.noPengenalan)
  return null
}

export function binaPetaMurid(senaraiMurid) {
  return {
    idById: new Map(senaraiMurid.map((m) => [m.id, m])),
    idByNoPengenalan: new Map(senaraiMurid.filter((m) => m.noPengenalan).map((m) => [m.noPengenalan, m])),
  }
}

export function kesanIcRosak(nilai) {
  return POLA_SAINTIFIK.test(nilai ?? '')
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

  const { idById, idByNoPengenalan } = binaPetaMurid(senaraiMurid)

  const hasil = barisData.map((baris, i) => {
    const data = {}
    headerBaris.forEach((h, idx) => {
      const kunci = PEMETAAN_LAJUR[h]
      if (!kunci || kunci === 'idMurid' || kunci === '_abai') return
      const nilai = baris[idx]
      data[kunci] = nilai == null ? '' : String(nilai).trim()
    })

    const idMuridMentah = headerBaris.includes('ID MURID') ? String(baris[headerBaris.indexOf('ID MURID')] ?? '').trim() : ''
    const murid = padankanMurid(data, idMuridMentah, idById, idByNoPengenalan)

    return {
      barisKe: i + 2,
      sepadan: Boolean(murid),
      icRosak: kesanIcRosak(data.noPengenalan),
      data: { ...data, muridId: murid?.id ?? null },
    }
  })

  const bilanganIcRosak = hasil.filter((h) => h.icRosak).length

  return { hasil, lajurTakDikenali, bilanganIcRosak }
}
