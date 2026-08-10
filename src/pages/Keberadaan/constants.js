export const URUSAN_OPTIONS = ['Rasmi', 'Cuti', 'Keluar Waktu Bekerja (KWB)']

// Senarai "Jenis" ditapis ikut Urusan yang dipilih.
// KWB tiada senarai jenis - terus ke masa keluar/kembali.
export const JENIS_MENGIKUT_URUSAN = {
  Rasmi: ['Rasmi (Tiada di sekolah)', 'Rasmi (Berada di sekolah)'],
  Cuti: ['Cuti Rehat Khas', 'Cuti Rehat', 'Cuti Sakit', 'Cuti Tanpa Rekod', 'Lain-lain (nyatakan)'],
}

// Kumpulan paparan untuk Keberadaan Hari Ini / Esok - 3 seksyen berasingan,
// sepadan terus dengan nilai Kategori (Guru / PPM / AKP).
// Nota: Laporan Harian (akan datang) hanya kira Guru + PPM - AKP dikecualikan.
export const KUMPULAN_KEBERADAAN = ['Guru', 'PPM', 'AKP']

export function kumpulanKategori(kategori) {
  return KUMPULAN_KEBERADAAN.includes(kategori) ? kategori : 'Guru'
}
