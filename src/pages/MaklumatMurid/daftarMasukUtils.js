// Gabung alamat berpecah (alamat1/2/3 + poskod/bandar/daerah/negeri) jadi
// satu rentetan penuh - dipakai untuk paparan/pratonton & cetakan Daftar
// Masuk Murid (borang kertas asal cuma satu lajur "ALAMAT").
export function gabungAlamat(m) {
  const baris = [m.alamat1, m.alamat2, m.alamat3].filter(Boolean).join(', ')
  const poskodBandar = [m.poskod, m.bandar].filter(Boolean).join(' ')
  const ekor = [poskodBandar, m.daerah, m.negeri].filter(Boolean).join(', ')
  return [baris, ekor].filter(Boolean).join(', ')
}

// Darjah/kelas - guna namaKelas kalau ada (lebih spesifik, cth "3 Bentong"),
// jatuh balik ke tahunTingkatan kalau tiada.
export function darjahMurid(m) {
  return m.namaKelas || m.tahunTingkatan || ''
}
