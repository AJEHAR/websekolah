export const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
export const NAMA_HARI_PENDEK = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

function keISO(tahun, bulan, hari) {
  const b = String(bulan + 1).padStart(2, '0')
  const h = String(hari).padStart(2, '0')
  return `${tahun}-${b}-${h}`
}

// Jana grid 6 baris x 7 lajur (42 sel) untuk satu bulan - termasuk hari
// "bocor" dari bulan sebelum/selepas (pudar, tapi tetap dipaparkan supaya
// grid sentiasa penuh/kemas, sama macam Google Calendar).
export function janaGridBulan(tahun, bulan) {
  const hariPertama = new Date(tahun, bulan, 1)
  const offsetMula = hariPertama.getDay() // 0=Ahad
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  const jumlahHariBulanLepas = new Date(tahun, bulan, 0).getDate()

  const sel = []
  // Hari bocor dari bulan lepas
  for (let i = offsetMula - 1; i >= 0; i--) {
    sel.push({ iso: keISO(bulan === 0 ? tahun - 1 : tahun, bulan === 0 ? 11 : bulan - 1, jumlahHariBulanLepas - i), dalamBulan: false, hari: jumlahHariBulanLepas - i })
  }
  // Hari dalam bulan ni
  for (let h = 1; h <= jumlahHari; h++) {
    sel.push({ iso: keISO(tahun, bulan, h), dalamBulan: true, hari: h })
  }
  // Hari bocor ke bulan depan (genapkan ke gandaan 7, max 6 baris = 42 sel)
  let hDepan = 1
  while (sel.length < 42) {
    sel.push({ iso: keISO(bulan === 11 ? tahun + 1 : tahun, bulan === 11 ? 0 : bulan + 1, hDepan), dalamBulan: false, hari: hDepan })
    hDepan++
  }
  return sel
}

// Acara yang bersilang/meliputi satu tarikh ISO tertentu (sokong acara
// berbilang hari - tarikhTamat boleh kosong, ertinya sehari sahaja).
export function acaraPadaTarikh(senaraiAcara, iso) {
  return senaraiAcara.filter((a) => {
    const mula = a.tarikhMula
    const tamat = a.tarikhTamat || a.tarikhMula
    return iso >= mula && iso <= tamat
  })
}

function isoKeDate(iso) {
  const [t, b, h] = iso.split('-').map(Number)
  return new Date(t, b - 1, h)
}
function dateKeISO(d) {
  return keISO(d.getFullYear(), d.getMonth(), d.getDate())
}

// 7 tarikh ISO (Ahad-Sabtu) untuk minggu yang mengandungi tarikhAsas.
export function janaMingguDariTarikh(tarikhAsasIso) {
  const asas = isoKeDate(tarikhAsasIso)
  const ahad = new Date(asas)
  ahad.setDate(asas.getDate() - asas.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ahad)
    d.setDate(ahad.getDate() + i)
    return dateKeISO(d)
  })
}

export function tambahHari(tarikhIso, delta) {
  const d = isoKeDate(tarikhIso)
  d.setDate(d.getDate() + delta)
  return dateKeISO(d)
}

// Susun senarai unit rata (flat) jadi struktur hierarki Unit induk ->
// Sub Unit (dulu dipanggil "Panitia"). unitIndukId kosong/null = Unit
// induk peringkat atas. Sub Unit yang unitIndukId dia tak wujud lagi
// (induk dah dipadam) jatuh balik ke senarai unit induk sendiri (fallback
// selamat - tak hilang terus dari paparan).
export function susunHierarkiUnit(senaraiUnit) {
  const indukSenarai = senaraiUnit.filter((u) => !u.unitIndukId)
  const indukId = new Set(indukSenarai.map((u) => u.id))
  const yatim = senaraiUnit.filter((u) => u.unitIndukId && !indukId.has(u.unitIndukId))
  return [...indukSenarai, ...yatim].map((induk) => ({
    ...induk,
    subUnit: senaraiUnit.filter((u) => u.unitIndukId === induk.id),
  }))
}
// Semua tarikh ISO dalam satu bulan (untuk paparan Jadual) - senarai
// mudah 1..akhir bulan, tiada hari "bocor" dari bulan lain (tak macam grid).
export function senaraiTarikhDalamBulan(tahun, bulan) {
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  return Array.from({ length: jumlahHari }, (_, i) => keISO(tahun, bulan, i + 1))
}
