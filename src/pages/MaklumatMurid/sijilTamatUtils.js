// Darjah = nombor pertama dalam nama kelas (cth. "6 Kuantan" -> "6").
// Fallback ke rentetan penuh kalau format tak dijangka (elak kosong terus).
export function darjahDariKelas(namaKelas) {
  if (!namaKelas) return ''
  const padanan = String(namaKelas).match(/^\d+/)
  return padanan ? padanan[0] : String(namaKelas)
}

// Cari unit UBKS yang murid sertai pada tahun tertentu, kumpul ikut
// kategori. Padanan kategori guna carian SEBAHAGIAN (bukan tepat) sebab
// admin urus nama kategori sendiri (cth. "Unit Beruniform", "Beruniform",
// "Uniform" semua patut sepadan) - hasil cuma CADANGAN, staff sahkan/edit.
export function cariUnitUBKS(muridId, tahunTamat, senaraiUnitUBKS) {
  const unitTahunIni = senaraiUnitUBKS.filter(
    (u) => String(u.tahunSesi) === String(tahunTamat) && u.ahli?.some((a) => a.idMurid === muridId)
  )

  function kumpulIkutKataKunci(kataKunci) {
    return unitTahunIni
      .filter((u) => (u.kategoriUnit ?? '').toLowerCase().includes(kataKunci))
      .map((u) => u.namaUnit)
      .join(', ')
  }

  return {
    unitBeruniform: kumpulIkutKataKunci('uniform'),
    kelab: kumpulIkutKataKunci('kelab'),
    sukan: kumpulIkutKataKunci('sukan'),
  }
}

// Auto-isi PENUH semasa cipta rekod baru - gabung data Murid + Daftar
// Masuk (kalau ada) + UBKS (kalau tahun tamat diisi). Pulangkan objek
// medan siap untuk diletak dalam borang (staff boleh edit semua terus).
export function autoIsiSijil(murid, rekodDaftarMasuk, tahunTamat, senaraiUnitUBKS) {
  const ubks = tahunTamat ? cariUnitUBKS(murid.id, tahunTamat, senaraiUnitUBKS) : { unitBeruniform: '', kelab: '', sukan: '' }
  return {
    noKP: murid.noPengenalan || '',
    nama: murid.nama || '',
    kelas: murid.namaKelas || '',
    darjah: darjahDariKelas(murid.namaKelas),
    tarikhMasukSekolah: murid.tarikhMasukSekolah || '',
    tarikhLahir: murid.tarikhLahir || '',
    namaPenjaga: murid.penjaga1Nama || '',
    noPendaftaran: rekodDaftarMasuk ? String(rekodDaftarMasuk.bilangan ?? '') : '',
    noSuratBeranak: rekodDaftarMasuk?.bilanganSuratBeranak || '',
    ...ubks,
  }
}
