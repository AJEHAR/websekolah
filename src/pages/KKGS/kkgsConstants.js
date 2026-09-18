// Jawatan Jawatankuasa KKGS - SUSUNAN ni penting (hierarki paparan dalam
// page Jawatankuasa). "Ahli" ialah LALAI untuk semua staff yang belum
// dilantik apa-apa jawatan khas - bukan jawatan sebenar, jadi Ahli biasa
// TAK dipaparkan dalam senarai Jawatankuasa (tapisan automatik). Nilai
// disimpan TERUS guna label penuh (KECUALI "Ahli" - dikekalkan pendek
// untuk keserasian rekod sedia ada, dipaparkan sebagai "Ahli KKGS
// (Selain Di Atas)" khusus dalam UI Jawatankuasa).
export const JAWATAN_KKGS = [
  'Penasihat',
  'Pengerusi',
  'Naib Pengerusi',
  'Setiausaha',
  'Bendahari 1',
  'Bendahari 2',
  'AJK KKGS',
  'Ahli',
]

// Jawatan yang cuma BOLEH SATU orang pegang serentak (bukan AJK, yang
// lazimnya ramai ahli) - lantikan baharu untuk jawatan ni AUTOMATIK
// "tanggalkan" pemegang lama (kembali ke "Ahli") - elak dua orang
// pegang jawatan sama serentak tanpa disedari.
export const JAWATAN_SATU_ORANG = ['Penasihat', 'Pengerusi', 'Naib Pengerusi', 'Setiausaha', 'Bendahari 1', 'Bendahari 2']

// Jawatan yang DIPILIH melalui Pilihan Raya KKGS (setiap 2 tahun) -
// SEMUA jawatan satu-orang KECUALI Penasihat (disandang Guru Besar
// secara automatik, bukan jawatan boleh diundi). AJK KKGS (ramai kerusi)
// diundi berasingan - lihat KERUSI_AJK_LALAI.
export const JAWATAN_DIPILIH = JAWATAN_SATU_ORANG.filter((j) => j !== 'Penasihat')

// Bilangan kerusi AJK KKGS (kumpulan, bukan satu orang) LALAI untuk
// sesi Pilihan Raya baharu - admin boleh ubah ikut sesi (cth. jumlah
// keseluruhan jawatankuasa 10 kerusi = 5 jawatan bernama di atas + 5
// AJK KKGS biasa).
export const KERUSI_AJK_LALAI = 5

// Label untuk kumpulan AJK KKGS dalam undian - SATU pemalar dikongsi
// (bukan string literal ulang-ulang) supaya kod & UI konsisten.
export const JAWATAN_AJK_PILIHAN_RAYA = 'AJK KKGS'

// SUSUNAN PUSINGAN undian - LIVE, SATU jawatan SATU masa (bukan semua
// sekali gus) - ikut hierarki jawatan, AJK KKGS di akhir. Pemenang
// pusingan awal AUTOMATIK "hilang" (dikeluarkan) dari senarai calon
// pusingan SETERUSNYA - fix keluhan "nama sama menang lebih 1 jawatan
// sebab orang suka undi nama tu" - lepas seseorang menang Pengerusi cth.,
// dia TAK muncul lagi sebagai calon Naib Pengerusi/Setiausaha/.../AJK.
export const JAWATAN_URUTAN_PILIHAN_RAYA = [...JAWATAN_DIPILIH, JAWATAN_AJK_PILIHAN_RAYA]

// Tempoh undi LALAI (saat) setiap pusingan - admin boleh ubah nilai ni
// SETIAP KALI buka pusingan (medan input terus sebelum butang "Mula
// Pusingan"), bukan tetapan tetap seluruh sesi.
export const TEMPOH_UNDI_LALAI_SAAT = 90

// Status sesi Pilihan Raya KKGS - "draf" (admin sediakan tetapan/senarai
// tak layak dulu, belum boleh undi), "berjalan" (staff boleh undi
// SEKALI setiap jawatan), "selesai" (ditutup, keputusan diterbitkan -
// TIDAK boleh diundi/diubah lagi).
export const STATUS_PILIHAN_RAYA = [
  { nilai: 'draf', label: 'Draf' },
  { nilai: 'berjalan', label: 'Sedang Berjalan' },
  { nilai: 'selesai', label: 'Selesai' },
]

export function labelStatusPilihanRaya(nilai) {
  return STATUS_PILIHAN_RAYA.find((s) => s.nilai === nilai)?.label ?? nilai
}

export function labelJawatan(jawatan) {
  return jawatan === 'Ahli' ? 'Ahli KKGS (Selain Di Atas)' : jawatan
}

// Sesiapa dengan jawatan LAIN daripada "Ahli" dianggap Jawatankuasa -
// label/paparan SAHAJA (untuk page Jawatankuasa). PENTING: ini BUKAN
// asas kebenaran sistem - kebenaran urus (Yuran/Kewangan/Claim/Senarai
// Ahli) guna peranan admin BIASA (isAdminSeksyen('kkgs') di
// firestore.rules, useIsAdmin(user).adaSeksyen('kkgs') di klien) - sama
// corak macam KURI/HEM/KOKU, dilantik melalui Panel Admin.
export function adalahJawatankuasa(jawatan) {
  return Boolean(jawatan) && jawatan !== 'Ahli'
}

// Status keahlian - "aktif" sahaja yang diminta bayar yuran lagi. Semua
// status LAIN (pindah/berhenti/bersara) HENTIKAN bil masa depan tapi
// KEKALKAN rekod baki/sejarah bayaran lama (bukan dipadam) - untuk audit
// kewangan KKGS tetap tepat.
export const STATUS_KEAHLIAN = [
  { nilai: 'aktif', label: 'Aktif' },
  { nilai: 'pindah', label: 'Pindah (Kekal Baki)' },
  { nilai: 'berhenti', label: 'Berhenti Kerja (Kekal Baki)' },
  { nilai: 'bersara', label: 'Bersara (Kekal Baki)' },
]

export function labelStatusKeahlian(nilai) {
  return STATUS_KEAHLIAN.find((s) => s.nilai === nilai)?.label ?? nilai
}

// Status Program/Aktiviti KKGS - "akan-datang" LALAI untuk program baharu
// (belum sampai/lepas tarikh), AJK tukar SECARA MANUAL ke "selesai" atau
// "tangguh" bila perlu (bukan automatik ikut tarikh - AJK yang paling tahu
// program tu betul-betul jalan atau tidak pada hari tu).
export const STATUS_PROGRAM = [
  { nilai: 'akan-datang', label: 'Akan Datang' },
  { nilai: 'selesai', label: 'Selesai' },
  { nilai: 'tangguh', label: 'Tangguh' },
]

export function labelStatusProgram(nilai) {
  return STATUS_PROGRAM.find((s) => s.nilai === nilai)?.label ?? nilai
}

// ID KHAS untuk pilihan "Lain-lain" dalam dropdown Program/Aktiviti (Rekod
// Transaksi Kewangan & Tuntutan Resit) - bila dipilih, staff KENA isi
// medan teks bebas (bukan dari senarai Program/Aktiviti dirancang). Guna
// SATU pemalar dikongsi (bukan string literal ulang-ulang) - elak silap
// taip antara dua page yang guna corak sama ni.
export const PROGRAM_LAIN_ID = 'lain-lain'

// Pilihan tahun DIKONGSI merentasi Yuran & Kewangan - PENTING kekal SAMA
// supaya tahun boleh dilihat konsisten di kedua-dua page (dulu Yuran &
// Kewangan guna senarai tahun BERBEZA - bug #5, tahun boleh guna kat
// satu page tapi tak boleh dilihat di page lain).
const TAHUN_SEMASA_KKGS = new Date().getFullYear()
export const PILIHAN_TAHUN_KKGS = [TAHUN_SEMASA_KKGS - 2, TAHUN_SEMASA_KKGS - 1, TAHUN_SEMASA_KKGS, TAHUN_SEMASA_KKGS + 1, TAHUN_SEMASA_KKGS + 2, TAHUN_SEMASA_KKGS + 3]
export const TAHUN_SEMASA = TAHUN_SEMASA_KKGS

// Senarai Jenis Imbuhan KKGS - jumlah TETAP setiap jenis (bukan staff
// taip jumlah sendiri macam Resit) - diambil dari surat pekeliling KKGS
// yang dikongsi pengguna. BOLEH kemas kini di sini bila-bila (tambah/
// buang/ubah jumlah) - senarai ni dikongsi seluruh sistem Claim.
export const JENIS_IMBUHAN_KKGS = [
  { label: 'Sakit masuk wad (3 hari)', jumlah: 30, keterangan: 'Kemasukan wad tahun semasa sahaja (tidak termasuk tahun-tahun lepas).' },
  { label: 'Kahwin Kali Pertama', jumlah: 100, keterangan: 'Mana-mana perkahwinan PERTAMA anda semasa menjadi ahli KKGS SKPK.' },
  { label: 'Kematian Ahli Keluarga Terdekat', jumlah: 50, keterangan: 'Ahli keluarga terdekat bermaksud: Ibu, Bapa, Adik-beradik, Suami/Isteri, atau Anak.' },
  { label: 'Bersalin Kali Pertama', jumlah: 50, keterangan: 'Kelahiran anak PERTAMA (lelaki atau perempuan bersalin) semasa berada/berkhidmat di SKPK.' },
  { label: 'Pertukaran', jumlah: 100, keterangan: 'Pertukaran rasmi keluar dari SKPK.' },
  { label: 'Bersara', jumlah: 100, keterangan: 'Persaraan rasmi daripada perkhidmatan.' },
]

// Nama 12 bulan kalendar (TETAP - Jan hingga Dis) - "bilanganBulan" (10-12)
// tentukan berapa BANYAK bulan PERTAMA dikenakan yuran (cth. 10 = Jan-Okt
// dikenakan, Nov-Dis dikecualikan) - disahkan dengan pengguna.
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

// Algoritma peruntukan bayaran automatik - PENTING, ini JANTUNG ciri
// Yuran. Diberi jumlah TOTAL dibayar (semua rekod bayaran ahli tahun tu
// dijumlahkan) dan kadar bulanan tetap, kira status SETIAP bulan dalam
// julat berkenaan (bulanMula ahli hingga bulan efektif tamat, dikunci
// oleh bilanganBulan tetapan tahun tu):
//   - 'penuh'   -> bulan tu genap dibayar (jumlah = kadar bulanan)
//   - 'separuh' -> baki wang tak cukup genap sebulan (jumlah = baki)
//   - 'belum'   -> tiada wang sampai ke bulan tu lagi
// Wang diagihkan SECARA BERTURUTAN bulan demi bulan (bukan agihan rata) -
// contoh: kadar RM15, bayar RM20 -> Bulan 1 PENUH (RM15), Bulan 2
// SEPARUH (RM5) - padan tepat contoh yang diberi pengguna.
export function kiraPeruntukanYuran({ bulanMula, bulanTamat, kadarBulanan, jumlahDibayar }) {
  let baki = jumlahDibayar
  const bulanList = []
  for (let b = bulanMula; b <= bulanTamat; b++) {
    if (baki >= kadarBulanan) {
      bulanList.push({ bulan: b, status: 'penuh', jumlah: kadarBulanan })
      baki -= kadarBulanan
    } else if (baki > 0) {
      bulanList.push({ bulan: b, status: 'separuh', jumlah: baki })
      baki = 0
    } else {
      bulanList.push({ bulan: b, status: 'belum', jumlah: 0 })
    }
  }
  const jumlahDiperlukan = (bulanTamat - bulanMula + 1) * kadarBulanan
  const lengkapPenuh = bulanList.length > 0 && bulanList.every((b) => b.status === 'penuh')
  const lebihan = jumlahDibayar > jumlahDiperlukan ? jumlahDibayar - jumlahDiperlukan : 0
  return { bulanList, jumlahDiperlukan, jumlahDibayar, lengkapPenuh, lebihan }
}
