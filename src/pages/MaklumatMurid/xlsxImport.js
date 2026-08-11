import * as XLSX from 'xlsx'
import { PEMETAAN_MEDAN } from './muridFields.js'

// Baca fail Excel dan cari baris header SECARA AUTOMATIK - fail rasmi MOEIS/APDM
// selalu ada beberapa baris tajuk (nama laporan, nama sekolah, kod sekolah) sebelum
// baris header sebenar, jadi kita tak boleh andaikan baris 1 = header.
export async function baiFailMuridXlsx(fail) {
  const buffer = await fail.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const helaian = wb.Sheets[wb.SheetNames[0]]
  const semuaBaris = XLSX.utils.sheet_to_json(helaian, { header: 1, defval: null })

  const indeksHeader = semuaBaris.findIndex(
    (baris) =>
      Array.isArray(baris) &&
      baris.some((c) => String(c ?? '').trim() === 'BIL.') &&
      baris.some((c) => String(c ?? '').trim() === 'ID MURID')
  )

  if (indeksHeader === -1) {
    throw new Error('Tidak jumpa baris header ("BIL." dan "ID MURID") dalam fail ni. Sila semak fail betul.')
  }

  const headerBaris = semuaBaris[indeksHeader].map((h) => String(h ?? '').trim())
  const barisData = semuaBaris
    .slice(indeksHeader + 1)
    .filter((baris) => Array.isArray(baris) && baris[0] != null && String(baris[0]).trim() !== '')

  const senaraiMurid = barisData
    .map((baris) => {
      const rekod = {}
      headerBaris.forEach((header, i) => {
        const kunci = PEMETAAN_MEDAN[header]
        if (!kunci) return // abaikan lajur "BIL." atau lajur tak dikenali
        const nilai = baris[i]
        rekod[kunci] = nilai === undefined || nilai === null || nilai === '' ? null : String(nilai).trim()
      })
      // Medan terbitan (bukan dari Excel) - Status RMT: murid BUKAN asrama = RMT.
      // STATUS ASRAMA kosong/tiada data (bukan 'YA') bermakna murid tu RMT.
      rekod.statusRMT = rekod.statusAsrama && rekod.statusAsrama.toUpperCase() === 'YA' ? 'TIDAK' : 'YA'
      return rekod
    })
    .filter((r) => r.idMurid)

  const lajurTakDikenali = headerBaris.filter((h) => h && h !== 'BIL.' && !PEMETAAN_MEDAN[h])

  return { senaraiMurid, lajurTakDikenali }
}
