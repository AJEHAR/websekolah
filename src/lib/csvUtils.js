// Parser CSV ringkas (sokong medan dalam tanda petik yang ada koma/baris baru
// di dalamnya) - elak perlu tambah pustaka luar untuk kegunaan mudah ni.
// PENTING: parser ni teks-TULEN sepenuhnya (tiada agakan jenis data macam
// tarikh/nombor) - ni SENGAJA, elak bug "tarikh bertukar jadi nombor siri
// Excel" yang berlaku kalau guna pustaka macam XLSX/SheetJS untuk baca CSV
// (pustaka spreadsheet cuba "pandai" kesan format sel, CSV sendiri tiada
// konsep jenis sel - semuanya teks).
function tokenkanCSV(teks) {
  const baris = []
  let semasaBaris = []
  let semasaMedan = ''
  let dalamPetikan = false

  for (let i = 0; i < teks.length; i++) {
    const a = teks[i]
    if (dalamPetikan) {
      if (a === '"' && teks[i + 1] === '"') {
        semasaMedan += '"'
        i++
      } else if (a === '"') {
        dalamPetikan = false
      } else {
        semasaMedan += a
      }
    } else if (a === '"') {
      dalamPetikan = true
    } else if (a === ',') {
      semasaBaris.push(semasaMedan)
      semasaMedan = ''
    } else if (a === '\n' || a === '\r') {
      if (a === '\r' && teks[i + 1] === '\n') i++
      semasaBaris.push(semasaMedan)
      semasaMedan = ''
      if (semasaBaris.some((m) => m.trim() !== '')) baris.push(semasaBaris)
      semasaBaris = []
    } else {
      semasaMedan += a
    }
  }
  if (semasaMedan !== '' || semasaBaris.length > 0) {
    semasaBaris.push(semasaMedan)
    if (semasaBaris.some((m) => m.trim() !== '')) baris.push(semasaBaris)
  }
  return baris
}

// Guna bila tajuk lajur sebenar diketahui/dipercayai - pulangkan objek
// {tajukLajur: nilai} setiap baris.
export function uraiCSV(teks) {
  const baris = tokenkanCSV(teks)
  if (baris.length === 0) return []
  const header = baris[0].map((h) => h.trim())
  return baris.slice(1).map((b) => {
    const objek = {}
    header.forEach((h, i) => {
      objek[h] = (b[i] ?? '').trim()
    })
    return objek
  })
}

// Guna bila tajuk lajur SEBENAR tak diketahui/tak boleh dipercayai (cth.
// eksport daripada sistem lain) - pulangkan array-mentah setiap baris
// (baris[0] = header, baris[1+] = data), akses ikut KEDUDUKAN lajur.
export function uraiCSVBaris(teks) {
  return tokenkanCSV(teks)
}

export function muatTurunCSV(namaFail, header, baris) {
  const semuaBaris = [header, ...baris]
  const teks = semuaBaris
    .map((b) => b.map((m) => `"${String(m ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob(['\uFEFF' + teks], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = namaFail
  a.click()
  URL.revokeObjectURL(url)
}
