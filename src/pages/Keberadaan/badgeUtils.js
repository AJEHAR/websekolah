// Warna badge ikut jenis urusan - digunakan dalam kad Hari Ini/Esok/Log.
export function warnaBadge(urusan) {
  if (urusan === 'Rasmi') return { bg: '#E1F5EE', teks: '#0F6E56' }
  if (urusan === 'Cuti') return { bg: '#FAEEDA', teks: '#854F0B' }
  if (urusan === 'Keluar Waktu Bekerja (KWB)') return { bg: '#FCEBEB', teks: '#A32D2D' }
  return { bg: '#F1EFE8', teks: '#5F5E5A' }
}

export function labelRingkas(rekod) {
  const jenisPaparan = rekod.jenis === 'Lain-lain (nyatakan)' ? rekod.jenisLain : rekod.jenis
  if (rekod.urusan === 'Keluar Waktu Bekerja (KWB)') {
    const masa = rekod.masaKeluar ? `${rekod.masaKeluar}${rekod.masaKembali ? '–' + rekod.masaKembali : ''}` : ''
    return [jenisPaparan, masa].filter(Boolean).join(' · ')
  }
  return jenisPaparan || rekod.urusan
}

// Untuk paparan ringkas (Kalendar Bulanan, Senarai Keberadaan Saya):
// Rasmi -> papar Catatan (nama urusan rasmi); Cuti -> papar Jenis sahaja (bukan catatan/sebab,
// demi privasi); KWB -> sama macam labelRingkas biasa.
export function labelSenarai(rekod) {
  if (rekod.urusan === 'Rasmi') return rekod.catatan || rekod.jenis
  if (rekod.urusan === 'Cuti') return rekod.jenis === 'Lain-lain (nyatakan)' ? rekod.jenisLain : rekod.jenis
  return labelRingkas(rekod)
}
