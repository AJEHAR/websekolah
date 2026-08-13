// Parser CSV ringkas (sokong medan dalam tanda petik yang ada koma/baris baru
// di dalamnya) - elak perlu tambah pustaka luar untuk kegunaan mudah ni.
export function uraiCSV(teks) {
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
