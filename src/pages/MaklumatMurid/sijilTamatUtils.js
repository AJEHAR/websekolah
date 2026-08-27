// Darjah = nombor pertama dalam nama kelas (cth. "6 Kuantan" -> "6").
// Fallback ke rentetan penuh kalau format tak dijangka (elak kosong terus).
export function darjahDariKelas(namaKelas) {
  if (!namaKelas) return ''
  const padanan = String(namaKelas).match(/^\d+/)
  return padanan ? padanan[0] : String(namaKelas)
}

// Cari unit UBKS yang murid sertai pada tahun tertentu, kumpul ikut
// kategori. PENTING: unit.kategoriUnit simpan KOD ringkas (cth. "UB"),
// bukan nama penuh - kena selesaikan ke NAMA kategori dulu (guna
// senaraiKategori dari useKategoriUBKS) sebelum padan kata kunci, kalau
// tidak padanan sentiasa gagal senyap (kod pendek jarang mengandungi
// "uniform"/"kelab"/"sukan"). Padanan kata kunci pada NAMA guna carian
// SEBAHAGIAN (bukan tepat) sebab admin urus nama kategori sendiri (cth.
// "Unit Beruniform", "Badan Beruniform", "Uniform" semua patut sepadan)
// - hasil cuma CADANGAN, staff sahkan/edit.
export function cariUnitUBKS(muridId, tahunTamat, senaraiUnitUBKS, senaraiKategori = []) {
  const namaKategoriIkutKod = {}
  senaraiKategori.forEach((k) => { namaKategoriIkutKod[k.kod] = k.nama })

  const unitTahunIni = senaraiUnitUBKS.filter(
    (u) => String(u.tahunSesi) === String(tahunTamat) && u.ahli?.some((a) => a.idMurid === muridId)
  )

  function kumpulIkutKataKunci(kataKunci) {
    return unitTahunIni
      .filter((u) => {
        const namaKategori = namaKategoriIkutKod[u.kategoriUnit] ?? u.kategoriUnit ?? ''
        return namaKategori.toLowerCase().includes(kataKunci)
      })
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
