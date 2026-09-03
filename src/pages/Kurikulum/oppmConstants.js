// Senarai 12 bulan (Bahasa Melayu) - untuk pemilih Tempoh & susunan lajur status bulanan.
export const BULAN_SENARAI = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

// Jana senarai bulan BERTURUTAN dari bulanMula ke bulanAkhir - SOKONG
// tempoh yang merentasi tahun (cth. templat rujukan: "Julai...Feb", "Feb
// hingga Dis") - kalau indeks akhir < indeks mula, anggap ia sambung ke
// tahun depan (bukan ralat).
export function janaJulatBulan(bulanMula, bulanAkhir) {
  const i1 = BULAN_SENARAI.indexOf(bulanMula)
  const i2 = BULAN_SENARAI.indexOf(bulanAkhir)
  if (i1 === -1 || i2 === -1) return []
  const hasil = []
  let i = i1
  while (true) {
    hasil.push(BULAN_SENARAI[i])
    if (i === i2) break
    i = (i + 1) % 12
    if (hasil.length > 12) break // jaring keselamatan - elak gelung tak terhingga
  }
  return hasil
}

// Status setiap tugasan BAGI SATU BULAN - dropdown ringkas (bukan klik
// titik ⚪⚫ manual dalam grid mentah) - dipetakan ke simbol asal templat
// bila DICETAK sahaja (lihat CetakOPPM.jsx). PENTING: label ⚪ ikut
// legenda SEBENAR templat rujukan ialah "Belum Siap" (bukan "Sedang
// Berjalan" - anggapan awal yang silap, dah dibetulkan).
export const STATUS_BULANAN = [
  { nilai: 'belum', label: 'Tiada (kosong)', simbol: '' },
  { nilai: 'jalan', label: 'Belum Siap', simbol: '⚪' },
  { nilai: 'siap', label: 'Siap', simbol: '⚫' },
]

export const TAHAP_TANGGUNGJAWAB = ['A', 'B', 'C']
export const LABEL_TAHAP = { A: 'Utama', B: 'Kedua', C: 'Ketiga' }
