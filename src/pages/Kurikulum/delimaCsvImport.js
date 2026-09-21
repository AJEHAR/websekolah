import { uraiCSV } from '../../lib/csvUtils.js'

// Baca fail CSV eksport rasmi "DELIMa Pelajar Sekolah" (header sebenar:
// "ID DELIMa", NAMA, "MOEIS ID", OU, "KOD ORGANISASI", "NAMA ORGANISASI",
// NEGERI, DAERAH, KELAS, "KOD KELAS", "ALIRAN KELAS", "BIDANG KELAS",
// "STATUS WARGANEGARA", "LOG TERAKHIR"). Fail ni TIADA kata laluan (KPM
// tak eksport tu) - cuma emel/ID Delima + maklumat murid, jadi import ni
// HANYA isi emel (bukan kata laluan) - kata laluan tetap diisi manual satu
// per satu dalam page.
//
// Padanan dengan rekod Murid semasa guna "MOEIS ID" (lajur CSV) <->
// idMurid (ID dokumen koleksi 'murid') - dua-dua ID rasmi KPM yang SAMA
// (bukan No. Kad Pengenalan), berdasarkan corak sedia ada
// (daftarMasukCsvImport.js turut bezakan "ID MURID" drpd No.KP).
export async function baiFailDelimaCsv(fail, senaraiMurid) {
  const teks = await fail.text()
  const baris = uraiCSV(teks)

  if (baris.length === 0) {
    throw new Error('Fail CSV kosong atau format tak dikenali.')
  }

  const contohBaris = baris[0]
  const ada = (lajur) => Object.prototype.hasOwnProperty.call(contohBaris, lajur)
  if (!ada('ID DELIMa') || !ada('MOEIS ID')) {
    throw new Error('Fail ni tak nampak macam eksport DELIMa Pelajar - lajur "ID DELIMa"/"MOEIS ID" tak dijumpai.')
  }

  const idByMoeisId = new Map(senaraiMurid.filter((m) => m.id).map((m) => [String(m.id).trim(), m]))

  const hasil = baris.map((b, i) => {
    const moeisId = String(b['MOEIS ID'] ?? '').trim()
    const emel = String(b['ID DELIMa'] ?? '').trim()
    const nama = String(b['NAMA'] ?? '').trim()
    const kelas = String(b['KELAS'] ?? '').trim()
    const murid = moeisId ? idByMoeisId.get(moeisId) : null

    return {
      barisKe: i + 2,
      sepadan: Boolean(murid),
      muridId: murid?.id ?? null,
      namaSistem: murid?.nama ?? null,
      moeisId, emel, nama, kelas,
    }
  })

  const bilanganSepadan = hasil.filter((h) => h.sepadan).length
  return { hasil, bilanganSepadan }
}
