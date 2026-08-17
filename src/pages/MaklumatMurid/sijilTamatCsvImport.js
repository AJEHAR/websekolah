import * as XLSX from 'xlsx'

const PEMETAAN_LAJUR = {
  'BIL': 'bilangan', 'BILANGAN': 'bilangan',
  'NO KP': 'noKP', 'NO. KP': 'noKP', 'NO KAD PENGENALAN': 'noKP',
  'NAMA': 'nama',
  'KELAS': 'kelas',
  'DARJAH': 'darjah',
  'TAHUN TAMAT': 'tahunTamat',
  'NO PENDAFTARAN': 'noPendaftaran', 'NO. PENDAFTARAN': 'noPendaftaran',
  'TARIKH KELUAR SEKOLAH': 'tarikhKeluarSekolah',
  'TARIKH MASUK SEKOLAH': 'tarikhMasukSekolah',
  'TARIKH LAHIR': 'tarikhLahir',
  'NO SURAT BERANAK': 'noSuratBeranak', 'NO. SURAT BERANAK': 'noSuratBeranak',
  'KELAKUAN': 'kelakuan',
  'SEBAB BERHENTI': 'sebabBerhenti',
  'NAMA IBU BAPA PENJAGA': 'namaPenjaga', 'NAMA IBU BAPA/PENJAGA': 'namaPenjaga',
  'JUMLAH KEHADIRAN': 'jumlahKehadiran',
  'UNIT BERUNIFORM': 'unitBeruniform',
  'KELAB': 'kelab',
  'SUKAN': 'sukan',
}

// Baca CSV Sijil Tamat (data lama) - TIADA keperluan padanan wajib dengan
// rekod Murid (tak macam Daftar Masuk) sebab sijil sudah pun SNAPSHOT
// lengkap (semua 18 medan asal dari buku rekod kertas). Padanan No.KP
// dengan Murid sedia ada cuma BONUS (kaitkan muridId untuk rujukan), bukan
// syarat - baris tetap diimport walaupun tiada padanan dijumpai.
export async function baiFailSijilTamatCsv(fail, senaraiMurid) {
  const teks = await fail.text()
  const wb = XLSX.read(teks, { type: 'string' })
  const helaian = wb.Sheets[wb.SheetNames[0]]
  const semuaBaris = XLSX.utils.sheet_to_json(helaian, { header: 1, defval: null })

  if (semuaBaris.length === 0) throw new Error('Fail CSV kosong.')

  const headerBaris = semuaBaris[0].map((h) => String(h ?? '').trim().toUpperCase())
  const barisData = semuaBaris.slice(1).filter((b) => Array.isArray(b) && b.some((c) => c != null && String(c).trim() !== ''))
  const lajurTakDikenali = headerBaris.filter((h) => h && !PEMETAAN_LAJUR[h])

  const idByNoPengenalan = new Map(senaraiMurid.filter((m) => m.noPengenalan).map((m) => [m.noPengenalan, m]))

  const hasil = barisData.map((baris, i) => {
    const data = {}
    headerBaris.forEach((h, idx) => {
      const kunci = PEMETAAN_LAJUR[h]
      if (!kunci) return
      const nilai = baris[idx]
      data[kunci] = nilai == null ? '' : String(nilai).trim()
    })
    const muridSepadan = data.noKP ? idByNoPengenalan.get(data.noKP) : null
    if (muridSepadan) data.muridId = muridSepadan.id
    return { barisKe: i + 2, data }
  })

  return { hasil, lajurTakDikenali }
}
