// Kumpulkan senarai unit (rata) ikut Kategori UBKS, susun ikut turutan
// kategori yang admin tetapkan (Panel Admin > Kategori UBKS). Dikongsi
// oleh SEMUA page senarai unit (Murid UBKS, Jawatankuasa UBKS, Laporan
// UBKS) - satu logik kumpulan sahaja, konsisten di seluruh modul.
export function kumpulUnitIkutKategori(unitSenarai, kategoriSenarai) {
  const kumpulan = {}
  unitSenarai.forEach((u) => {
    const kod = u.kategoriUnit || '_tiada'
    if (!kumpulan[kod]) kumpulan[kod] = []
    kumpulan[kod].push(u)
  })

  const kategoriTersusun = [...kategoriSenarai].sort((a, b) => (a.turutan ?? 0) - (b.turutan ?? 0))
  const hasil = kategoriTersusun
    .filter((k) => kumpulan[k.kod])
    .map((k) => ({
      kod: k.kod,
      label: k.nama,
      units: kumpulan[k.kod].sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? '')),
    }))

  if (kumpulan._tiada) {
    hasil.push({ kod: '_tiada', label: 'Tiada Kategori', units: kumpulan._tiada.sort((a, b) => (a.namaUnit ?? '').localeCompare(b.namaUnit ?? '')) })
  }

  return hasil
}
