export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function tambahHariISO(iso, hari) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + hari)
  return d.toISOString().slice(0, 10)
}

export function formatTarikhPaparan(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTarikhRingkas(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Kira bilangan hari (inklusif) dari julat [tarikhMula, tarikhTamat] yang
// bertindih dengan tahun tertentu - untuk analisis keberadaan tahunan.
export function hariDalamTahun(tarikhMula, tarikhTamat, tahun) {
  const mula = new Date(`${tarikhMula}T00:00:00`)
  const tamat = new Date(`${tarikhTamat}T00:00:00`)
  const awalTahun = new Date(`${tahun}-01-01T00:00:00`)
  const akhirTahun = new Date(`${tahun}-12-31T00:00:00`)

  const mulaEfektif = mula < awalTahun ? awalTahun : mula
  const tamatEfektif = tamat > akhirTahun ? akhirTahun : tamat

  if (mulaEfektif > tamatEfektif) return 0
  const bezaMs = tamatEfektif.getTime() - mulaEfektif.getTime()
  return Math.round(bezaMs / (1000 * 60 * 60 * 24)) + 1
}

const NAMA_HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

export function namaHari(tarikhISO) {
  const d = new Date(`${tarikhISO}T00:00:00`)
  return NAMA_HARI[d.getDay()]
}

// bulan: 1-12
export function bilanganHariDalamBulan(tahun, bulan) {
  return new Date(tahun, bulan, 0).getDate()
}
