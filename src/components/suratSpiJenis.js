import { FileText, FileCheck2, Mail, File } from 'lucide-react'

// Jenis dokumen tetap (4 sahaja - senaraikan semua di sini, dikongsi
// antara borang (SuratSpiModal) dan senarai/tapis (SuratSpi).
export const JENIS_DOKUMEN = [
  { nilai: 'pekeliling', label: 'Pekeliling', warna: { bg: '#FCEBEB', fg: '#C8102E' }, Ikon: FileText },
  { nilai: 'spi', label: 'SPI', warna: { bg: '#E6F1FB', fg: '#0C6FC9' }, Ikon: FileCheck2 },
  { nilai: 'surat', label: 'Surat Rasmi', warna: { bg: '#E1F5EE', fg: '#0F6E56' }, Ikon: Mail },
  { nilai: 'lain', label: 'Lain-lain', warna: { bg: '#F1EFE8', fg: '#5F5E5A' }, Ikon: File },
]

export function jenisInfo(nilai) {
  return JENIS_DOKUMEN.find((j) => j.nilai === nilai) ?? JENIS_DOKUMEN[3]
}

export function formatTarikhSurat(iso) {
  if (!iso) return null
  const [t, b, h] = iso.split('-')
  return `${h}/${b}/${t}`
}
