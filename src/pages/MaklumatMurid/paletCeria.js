// Palet warna "Sekolah Ceria" - warna-warni tapi kekal profesional/jelas
// dibaca (kontra cukup untuk teks putih di atasnya). Dikitar (cycle)
// ikut indeks untuk sebarang senarai kategori (kaum/agama/kelas/OKU) -
// supaya setiap kategori dapat identiti warna tersendiri secara automatik,
// tak kira berapa banyak pun pilihan (data-driven, bukan hardcode nama).
export const PALET_CERIA = [
  { bg: '#FCEBEB', fg: '#C8102E' }, // merah (brand)
  { bg: '#FFF4D6', fg: '#B8860B' }, // emas (brand)
  { bg: '#E1F5EE', fg: '#0F6E56' }, // hijau
  { bg: '#E6F1FB', fg: '#0C6FC9' }, // biru
  { bg: '#EEEDFE', fg: '#6C5CE7' }, // ungu
  { bg: '#FBEAF0', fg: '#C2255C' }, // pink
  { bg: '#FDECD8', fg: '#D2691E' }, // oren
  { bg: '#E8F6F6', fg: '#0E8A8A' }, // teal
]

export function warnaCeria(indeks) {
  return PALET_CERIA[indeks % PALET_CERIA.length]
}
