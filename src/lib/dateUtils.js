// Format Date jadi 'YYYY-MM-DD' guna komponen waktu TEMPATAN (bukan toISOString
// yang tukar ke UTC - punca bug "esok jadi hari ini" untuk zon UTC+8 macam Malaysia).
function formatISOTempatan(d) {
  const tahun = d.getFullYear()
  const bulan = String(d.getMonth() + 1).padStart(2, '0')
  const hari = String(d.getDate()).padStart(2, '0')
  return `${tahun}-${bulan}-${hari}`
}

export function todayISO() {
  return formatISOTempatan(new Date())
}

export function tambahHariISO(iso, hari) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + hari)
  return formatISOTempatan(d)
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

// Uraikan tarikh dari pelbagai format biasa (untuk import CSV, dll) jadi ISO
// YYYY-MM-DD. Sokong: '2026-01-12' (ISO), '12/1/2026' atau '12-1-2026'
// (DD/M/YYYY - format biasa orang taip/Excel eksport). Pulangkan null kalau
// tak dapat diuraikan (elak simpan tarikh/hari yang salah secara senyap).
export function uraiTarikhFleksibel(teks) {
  const t = String(teks ?? '').trim()
  if (!t) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t

  const padan = t.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/)
  if (padan) {
    const [, hari, bulan, tahun] = padan
    const h = Number(hari)
    const b = Number(bulan)
    if (b < 1 || b > 12 || h < 1 || h > 31) return null
    return `${tahun}-${String(b).padStart(2, '0')}-${String(h).padStart(2, '0')}`
  }

  return null
}
