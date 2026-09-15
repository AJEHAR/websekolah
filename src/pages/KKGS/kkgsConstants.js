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

// Senarai Jenis Imbuhan KKGS - jumlah TETAP setiap jenis (bukan staff
// taip jumlah sendiri macam Resit) - diambil dari surat pekeliling KKGS
// yang dikongsi pengguna. BOLEH kemas kini di sini bila-bila (tambah/
// buang/ubah jumlah) - senarai ni dikongsi seluruh sistem Claim.
export const JENIS_IMBUHAN_KKGS = [
  { label: 'Sakit masuk wad selama 3 hari', jumlah: 100 },
  { label: 'Berkahwin kali pertama', jumlah: 50 },
  { label: 'Kematian ahli keluarga terdekat', jumlah: 50 },
  { label: 'Bersalin kali pertama di SKPK', jumlah: 100 },
  { label: 'Pertukaran', jumlah: 100 },
  { label: 'Bersara', jumlah: 100 },
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
  return { bulanList, jumlahDiperlukan, jumlahDibayar, lengkapPenuh }
}
