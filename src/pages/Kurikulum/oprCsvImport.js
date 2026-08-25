import { uraiCSVBaris } from '../../lib/csvUtils.js'

// Urutan LAJUR TEPAT daripada sistem OPR lama (Code.gs fungsi saveReport) -
// guna KEDUDUKAN (bukan nama tajuk lajur, sebab tajuk sebenar dalam Sheet
// mungkin berbeza sikit) - lebih boleh dipercayai ikut susunan data ni:
// 0:Timestamp 1:ID(lama) 2:Unit 3:Nama 4:Hari 5:Tarikh 6:Tempat 7:Sasaran
// 8:Objektif 9:Aktiviti 10:Kekuatan 11:Kelemahan 12:Penambahbaikan
// 13:NamaDisediakan 14:JawatanDisediakan 15:SignDisediakanUrl
// 16:NamaDisahkan 17:JawatanDisahkan 18:SignDisahkanUrl
// 19:Images(JSON array) 20:bgUrl 21:Masa

// Muat naik terus fail EKSPORT MENTAH daripada Google Sheet (File > Download
// > Comma Separated Values .csv) - JANGAN susun semula lajur, guna terus
// macam yang ada.
export async function baiFailOprCsv(fail) {
  const teks = await fail.text()
  const semuaBaris = uraiCSVBaris(teks)

  if (semuaBaris.length === 0) throw new Error('Fail CSV kosong.')

  // Baris 1 = header (diabaikan, cuma guna kedudukan lajur)
  const barisData = semuaBaris.slice(1)

  const nilai = (b, i) => (b[i] == null ? '' : String(b[i]).trim())

  const hasil = barisData.map((b, i) => {
    let gambar = []
    const mentahGambar = nilai(b, 19)
    if (mentahGambar) {
      try {
        const diurai = JSON.parse(mentahGambar)
        if (Array.isArray(diurai)) gambar = diurai.filter(Boolean)
      } catch {
        // Bukan JSON sah (mungkin satu URL sahaja / format lama) - guna terus.
        gambar = [mentahGambar]
      }
    }
    // Tetap 4 slot (padan reka bentuk borang) - lebih daripada 4 dipotong,
    // kurang daripada 4 diisi kosong.
    while (gambar.length < 4) gambar.push(null)
    gambar = gambar.slice(0, 4)

    return {
      barisKe: i + 2,
      data: {
        unit: nilai(b, 2),
        nama: nilai(b, 3),
        hari: nilai(b, 4),
        tarikh: nilai(b, 5),
        tempat: nilai(b, 6),
        sasaran: nilai(b, 7),
        objektif: nilai(b, 8),
        aktiviti: nilai(b, 9),
        kekuatan: nilai(b, 10),
        kelemahan: nilai(b, 11),
        penambahbaikan: nilai(b, 12),
        namaDisediakan: nilai(b, 13),
        jawatanDisediakan: nilai(b, 14),
        tandaTanganDisediakanUrl: nilai(b, 15),
        namaDisahkan: nilai(b, 16),
        jawatanDisahkan: nilai(b, 17),
        tandaTanganDisahkanUrl: nilai(b, 18),
        gambar,
        latarBelakangUrl: nilai(b, 20),
        masa: nilai(b, 21),
        disahkanAktif: Boolean(nilai(b, 16)), // ada nama disahkan = seksyen tu aktif dulu
      },
    }
  })

  return hasil
}
