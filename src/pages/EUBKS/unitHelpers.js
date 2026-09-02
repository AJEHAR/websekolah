// unit.guruPenasihat rekod LAMA simpan STRING tunggal (ciri asal) - rekod
// BARU simpan ARRAY [{nama, tahunDarjah}]. Fungsi ni normalize dua-dua
// bentuk supaya UI selalu terima array, tak kira rekod lama/baru.
export function senaraiGuru(unit) {
  const g = unit?.guruPenasihat
  if (!g) return []
  if (typeof g === 'string') return g.trim() ? [{ nama: g.trim(), tahunDarjah: '' }] : []
  return g
}

// Bank tandatangan PER-UNIT - unit.tandaTanganTersimpan: [{nama, url}].
// Sekali seseorang (Guru Penasihat/Setiausaha) lukis tandatangan untuk
// unit ni, ia disimpan automatik & digunakan semula laporan akan datang -
// staff tak perlu lukis berulang setiap kali jana laporan baru.
export function cariTtdTersimpan(unit, nama) {
  if (!nama) return null
  return unit?.tandaTanganTersimpan?.find((t) => t.nama === nama)?.url ?? null
}

export function upsertTtdTersimpan(unit, nama, url) {
  const sedia = unit?.tandaTanganTersimpan ?? []
  const tanpaNamaIni = sedia.filter((t) => t.nama !== nama)
  return [...tanpaNamaIni, { nama, url }]
}

// Palet warna kepala cetakan Laporan Aktiviti Perjumpaan - PILIHAN TETAP
// sahaja (bukan color-picker bebas) supaya sentiasa kontras cukup dengan
// teks putih di atasnya. Ditetapkan sekali per-unit (unit.warnaLaporan),
// semua Laporan unit tu guna warna sama secara automatik.
export const PALET_WARNA_LAPORAN = [
  { nama: 'Biru (asal)', kod: '#1B0FB0' },
  { nama: 'Hijau', kod: '#0F6E56' },
  { nama: 'Merah', kod: '#C8102E' },
  { nama: 'Oren', kod: '#D2691E' },
  { nama: 'Ungu', kod: '#6C5CE7' },
  { nama: 'Merah Jambu', kod: '#C2255C' },
  { nama: 'Teal', kod: '#0E8A8A' },
  { nama: 'Coklat', kod: '#6B4A2F' },
  { nama: 'Hitam', kod: '#1A1A1A' },
]

export function warnaLaporanUnit(unit) {
  return unit?.warnaLaporan || PALET_WARNA_LAPORAN[0].kod
}
