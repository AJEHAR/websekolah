// Darjah = nombor pertama dalam nama kelas (cth. "6 Kuantan" -> "6").
// Fallback ke rentetan penuh kalau format tak dijangka (elak kosong terus).
export function darjahDariKelas(namaKelas) {
  if (!namaKelas) return ''
  const padanan = String(namaKelas).match(/^\d+/)
  return padanan ? padanan[0] : String(namaKelas)
}

// Cari unit UBKS yang murid sertai pada tahun tertentu, kumpul ikut
// kategori. PENTING: padanan guna medan "jenis" (tetap: 'beruniform' |
// 'kelab' | 'sukan') pada dokumen Kategori UBKS - BUKAN teka daripada
// teks "Nama Kategori" (admin taip bebas, tak boleh dijamin mengandungi
// perkataan "uniform"/"kelab"/"sukan" langsung - ini punca sebenar
// auto-isi gagal senyap sebelum ni). Kategori yang belum ditetapkan
// "jenis" (Panel Admin > Kategori UBKS) tak akan sepadan apa-apa pun -
// itu memang betul/dijangka, bukan bug; admin kena tetapkan sekali.
export function cariUnitUBKS(muridId, tahunTamat, senaraiUnitUBKS, senaraiKategori = []) {
  const jenisIkutKod = {}
  senaraiKategori.forEach((k) => { jenisIkutKod[k.kod] = k.jenis })

  const unitTahunIni = senaraiUnitUBKS.filter(
    (u) => String(u.tahunSesi) === String(tahunTamat) && u.ahli?.some((a) => a.idMurid === muridId)
  )

  function kumpulIkutJenis(jenis) {
    return unitTahunIni
      .filter((u) => jenisIkutKod[u.kategoriUnit] === jenis)
      .map((u) => u.namaUnit)
      .join(', ')
  }

  return {
    unitBeruniform: kumpulIkutJenis('beruniform'),
    kelab: kumpulIkutJenis('kelab'),
    sukan: kumpulIkutJenis('sukan'),
  }
}

// Auto-isi PENUH semasa cipta rekod baru - gabung data Murid + Daftar
// Masuk (kalau ada) + UBKS (kalau tahun tamat diisi). Pulangkan objek
// medan siap untuk diletak dalam borang (staff boleh edit semua terus).
export function autoIsiSijil(murid, rekodDaftarMasuk, tahunTamat, senaraiUnitUBKS, senaraiKategori = []) {
  const ubks = tahunTamat ? cariUnitUBKS(murid.id, tahunTamat, senaraiUnitUBKS, senaraiKategori) : { unitBeruniform: '', kelab: '', sukan: '' }
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
