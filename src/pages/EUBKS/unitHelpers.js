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
