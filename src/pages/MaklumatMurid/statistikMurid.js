export function adalahPra(m) {
  return (m.tahunTingkatan || '').toUpperCase().includes('PRASEKOLAH')
}

// Kira bilangan murid ikut nilai satu medan (contoh: jantina, kaum, agama)
export function kiraIkutMedan(senarai, medan) {
  const kiraan = {}
  senarai.forEach((m) => {
    const nilai = (m[medan] || '').trim() || 'Tiada Data'
    kiraan[nilai] = (kiraan[nilai] || 0) + 1
  })
  return Object.entries(kiraan)
    .map(([label, jumlah]) => ({ label, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
}

// Kira ikut kelas, pecahkan lagi ikut satu medan dalam setiap kelas
// Pulangkan: { [namaKelas]: { [nilaiMedan]: jumlah, __jumlah: totalKelas } }
export function kiraIkutKelas(senarai, medan) {
  const hasil = {}
  senarai.forEach((m) => {
    const kelas = (m.namaKelas || '').trim() || 'Tiada Kelas'
    const nilai = (m[medan] || '').trim() || 'Tiada Data'
    if (!hasil[kelas]) hasil[kelas] = { __jumlah: 0 }
    hasil[kelas][nilai] = (hasil[kelas][nilai] || 0) + 1
    hasil[kelas].__jumlah += 1
  })
  return hasil
}

// Kategori Ketidakupayaan (Sekolah Rendah SAHAJA - Prasekolah sentiasa
// dikecualikan, entiti berasingan). Untuk setiap kategori, sarangkan
// pecahan Jantina/Kaum/Agama/Subkategori SEKALI GUS.
export function kiraIkutKategoriOKU(senarai) {
  const bukanPra = senarai.filter((m) => !adalahPra(m))
  const kategoriUnik = [...new Set(bukanPra.map((m) => (m.kategoriKetidakupayaan || '').trim() || 'Tiada Data'))]

  return kategoriUnik
    .map((kategori) => {
      const ahli = bukanPra.filter((m) => ((m.kategoriKetidakupayaan || '').trim() || 'Tiada Data') === kategori)
      return {
        kategori,
        jumlah: ahli.length,
        jantina: kiraIkutMedan(ahli, 'jantina'),
        kaum: kiraIkutMedan(ahli, 'kaum'),
        agama: kiraIkutMedan(ahli, 'agama'),
        subkategori: kiraIkutMedan(ahli, 'subkategoriKetidakupayaan'),
      }
    })
    .sort((a, b) => b.jumlah - a.jumlah)
}
