import * as XLSX from 'xlsx'

// helaianSenarai: [{ namaHelaian, aoa }] - aoa = array-of-arrays (baris demi baris)
export function muatTurunXlsx(namaFail, helaianSenarai) {
  const wb = XLSX.utils.book_new()
  helaianSenarai.forEach(({ namaHelaian, aoa }) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    XLSX.utils.book_append_sheet(wb, ws, namaHelaian.slice(0, 31)) // had 31 aksara nama helaian Excel
  })
  XLSX.writeFile(wb, namaFail)
}
