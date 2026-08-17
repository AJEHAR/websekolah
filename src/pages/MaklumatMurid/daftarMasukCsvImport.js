import * as XLSX from 'xlsx'

// Lajur CSV yang dikenali (header -> kunci medan). "xlsx" (SheetJS) boleh
// baca fail .csv terus (bukan cuma .xlsx) - reuse pustaka sedia ada, elak
// tambah dependency baru untuk keperluan sama.
const PEMETAAN_LAJUR = {
  'BILANGAN': 'bilangan',
  'BIL': 'bilangan',
  'BIL.': 'bilangan',
  'ID MURID': 'idMurid',
  'NO KAD PENGENALAN': 'noPengenalan',
  'NO. KAD PENGENALAN': 'noPengenalan',
  'NAMA': 'namaRujukan', // rujukan/pengesahan visual sahaja - padanan SEBENAR guna ID MURID/No.KP
  'BILANGAN SURAT BERANAK': 'bilanganSuratBeranak',
  'TEMPAT DIPERANAKKAN': 'tempatDiperanakkan',
  'NO KEBENARAN': 'noKebenaran',
  'NO. KEBENARAN': 'noKebenaran',
  'SEKOLAH DAHULU': 'sekolahDahulu',
}

// Baca fail CSV Daftar Masuk Murid (data lama), padankan setiap baris
// dengan rekod Murid SEDIA ADA (ikut ID MURID dulu, jatuh balik ke No. Kad
// Pengenalan kalau ID MURID tiada/tak sepadan) - PENTING sebab rekod Daftar
// Masuk kena terikat (muridId) kepada rekod murid sebenar, bukan data
// bebas. Baris yang tak jumpa padanan ditanda "tiadaPadanan" - tak diimport
// automatik, staff boleh betulkan CSV & cuba lagi.
export async function baiFailDaftarMasukCsv(fail, senaraiMurid) {
  const teks = await fail.text()
  const wb = XLSX.read(teks, { type: 'string' })
  const helaian = wb.Sheets[wb.SheetNames[0]]
  const semuaBaris = XLSX.utils.sheet_to_json(helaian, { header: 1, defval: null })

  if (semuaBaris.length === 0) {
    throw new Error('Fail CSV kosong.')
  }

  const headerBaris = semuaBaris[0].map((h) => String(h ?? '').trim().toUpperCase())
  const barisData = semuaBaris.slice(1).filter((b) => Array.isArray(b) && b.some((c) => c != null && String(c).trim() !== ''))

  const lajurTakDikenali = headerBaris.filter((h) => h && !PEMETAAN_LAJUR[h])

  const idById = new Map(senaraiMurid.map((m) => [m.id, m]))
  const idByNoPengenalan = new Map(senaraiMurid.filter((m) => m.noPengenalan).map((m) => [m.noPengenalan, m]))

  const hasil = barisData.map((baris, i) => {
    const mentah = {}
    headerBaris.forEach((h, idx) => {
      const kunci = PEMETAAN_LAJUR[h]
      if (!kunci) return
      const nilai = baris[idx]
      mentah[kunci] = nilai == null ? '' : String(nilai).trim()
    })

    let murid = null
    if (mentah.idMurid && idById.has(mentah.idMurid)) murid = idById.get(mentah.idMurid)
    else if (mentah.noPengenalan && idByNoPengenalan.has(mentah.noPengenalan)) murid = idByNoPengenalan.get(mentah.noPengenalan)

    return {
      barisKe: i + 2, // +2: baris 1 = header, senarai manusia mula dari 1 bukan 0
      mentah,
      murid,
      sepadan: Boolean(murid),
    }
  })

  return { hasil, lajurTakDikenali }
}
