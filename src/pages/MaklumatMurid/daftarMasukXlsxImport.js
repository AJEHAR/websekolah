import * as XLSX from 'xlsx'
import { PEMETAAN_LAJUR, padankanMurid, binaPetaMurid, kesanIcRosak } from './daftarMasukCsvImport.js'

// Muat naik fail .xlsx TERUS (bukan CSV) - kaedah PALING SELAMAT untuk
// No. Kad Pengenalan/nombor panjang lain. Excel CSV export tukar nombor
// panjang (12 digit macam IC) jadi teks format saintifik ("1.40913E+11")
// dan DIGIT SEBENAR HILANG dalam proses tu - sekali dah jadi macam tu
// dalam fail CSV, mustahil dipulihkan (bukan isu teknik parsing, tapi
// data dah hilang). Baca .xlsx terus guna SheetJS elak masalah ni SEPENUHNYA
// sebab kita dapat NILAI NOMBOR ASAL terus dari fail (cth. 140913060273
// sebagai number JS - String() untuk integer sebegini TAK PERNAH jadi
// format saintifik dalam JavaScript, beza dengan cara Excel paparkan/
// eksport nombor besar).
//
// Cari helaian secara automatik (fail sekolah selalu ada banyak helaian -
// BUKU DAFTAR, QUERY, dll) - pilih helaian yang header dia paling banyak
// sepadan dengan PEMETAAN_LAJUR (BILANGAN/NAMA/dst), bukan andaikan
// helaian pertama.
function cariHelaianDaftarMasuk(wb) {
  let terbaik = null
  let skorTerbaik = -1
  for (const namaHelaian of wb.SheetNames) {
    const helaian = wb.Sheets[namaHelaian]
    const baris = XLSX.utils.sheet_to_json(helaian, { header: 1, defval: null, raw: true })
    if (baris.length === 0) continue
    const headerCalon = baris[0].map((h) => String(h ?? '').trim().toUpperCase())
    const skor = headerCalon.filter((h) => h && PEMETAAN_LAJUR[h]).length
    if (skor > skorTerbaik) {
      skorTerbaik = skor
      terbaik = { namaHelaian, baris, headerBaris: headerCalon }
    }
  }
  return skorTerbaik >= 3 ? terbaik : null // sekurang-kurangnya 3 lajur dikenali - elak salah pilih helaian bukan berkaitan
}

// Nilai sel Excel -> teks bersih. Nombor (termasuk IC/tarikh serial) TAK
// PERNAH ditukar ke format saintifik di sini (JS integer.toString() aman
// sehingga 1e21) - inilah kelebihan utama laluan .xlsx ni berbanding CSV.
function bersihkanNilai(nilai) {
  if (nilai == null) return ''
  if (nilai instanceof Date) {
    const p2 = (n) => String(n).padStart(2, '0')
    return `${p2(nilai.getDate())}/${p2(nilai.getMonth() + 1)}/${nilai.getFullYear()}`
  }
  if (typeof nilai === 'number') {
    return Number.isInteger(nilai) ? String(nilai) : String(nilai)
  }
  const s = String(nilai).trim()
  return s === '-' ? '' : s
}

export async function baiFailDaftarMasukXlsx(fail, senaraiMurid) {
  const buffer = await fail.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })

  const helaianDijumpai = cariHelaianDaftarMasuk(wb)
  if (!helaianDijumpai) {
    throw new Error('Tidak jumpa helaian dengan lajur Buku Daftar (BILANGAN/NAMA/dll) dalam fail ni. Pastikan fail Excel Buku Daftar Masuk Murid yang betul.')
  }
  const { headerBaris, baris: semuaBaris } = helaianDijumpai
  const barisData = semuaBaris.slice(1).filter((b) => Array.isArray(b) && b.some((c) => c != null && String(c).trim() !== ''))
  const lajurTakDikenali = headerBaris.filter((h) => h && !PEMETAAN_LAJUR[h])

  const { idById, idByNoPengenalan } = binaPetaMurid(senaraiMurid)

  const hasil = barisData.map((baris, i) => {
    const data = {}
    headerBaris.forEach((h, idx) => {
      const kunci = PEMETAAN_LAJUR[h]
      if (!kunci || kunci === 'idMurid' || kunci === '_abai') return
      data[kunci] = bersihkanNilai(baris[idx])
    })

    const idxIdMurid = headerBaris.indexOf('ID MURID')
    const idMuridMentah = idxIdMurid >= 0 ? bersihkanNilai(baris[idxIdMurid]) : ''
    const murid = padankanMurid(data, idMuridMentah, idById, idByNoPengenalan)

    return {
      barisKe: i + 2,
      sepadan: Boolean(murid),
      icRosak: kesanIcRosak(data.noPengenalan),
      data: { ...data, muridId: murid?.id ?? null },
    }
  })

  const bilanganIcRosak = hasil.filter((h) => h.icRosak).length

  return { hasil, lajurTakDikenali, bilanganIcRosak, namaHelaian: helaianDijumpai.namaHelaian }
}
