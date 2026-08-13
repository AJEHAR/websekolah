import { useMemo, useState } from 'react'
import { Printer, FileSpreadsheet } from 'lucide-react'
import { namaHari, bilanganHariDalamBulan } from '../../lib/dateUtils.js'
import { useKehadiranJulat, ambilKehadiranJulat } from '../../hooks/useKehadiranMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { muatTurunXlsx } from '../../lib/xlsxExport.js'
import CetakPapanRMT from './CetakPapanRMT.jsx'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
const SINGKATAN_HARI = { Ahad: 'A', Isnin: 'I', Selasa: 'S', Rabu: 'R', Khamis: 'K', Jumaat: 'J', Sabtu: 'S' }

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

// Lebar lajur tetap (px) - untuk kira offset "sticky" Bil/Nama/Jantina/Kelas
const LEBAR = { bil: 36, nama: 150, jantina: 56, kelas: 100 }
const KIRI = {
  bil: 0,
  nama: LEBAR.bil,
  jantina: LEBAR.bil + LEBAR.nama,
  kelas: LEBAR.bil + LEBAR.nama + LEBAR.jantina,
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

// Pivot data kehadiran mentah -> { pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari }
// Diekstrak supaya boleh dipakai semula untuk cetak (bukan cuma paparan langsung).
export function kiraDataRMT(kehadiranBulan) {
  const peta = {}
  const hadirIkutHari = {}
  const takHadirIkutHari = {}

  kehadiranBulan.forEach((rekod) => {
    const hari = Number(rekod.tarikh.slice(8, 10))
    rekod.senaraiMurid.forEach((m) => {
      if (!m.adalahRMT) return
      if (!peta[m.idMurid]) {
        peta[m.idMurid] = { idMurid: m.idMurid, nama: m.nama, jantina: m.jantina, namaKelas: rekod.namaKelas, tick: {} }
      }
      peta[m.idMurid].tick[hari] = m.hadir
      if (m.hadir) hadirIkutHari[hari] = (hadirIkutHari[hari] ?? 0) + 1
      else takHadirIkutHari[hari] = (takHadirIkutHari[hari] ?? 0) + 1
    })
  })

  const senarai = Object.values(peta).sort(
    (a, b) => a.namaKelas.localeCompare(b.namaKelas) || a.nama.localeCompare(b.nama)
  )
  return { pelajar: senarai, jumlahHadirIkutHari: hadirIkutHari, jumlahTakHadirIkutHari: takHadirIkutHari }
}

export default function PapanRMT() {
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)

  const hariDalamBulan = bilanganHariDalamBulan(tahun, bulan)
  const dari = `${tahun}-${pad2(bulan)}-01`
  const hingga = `${tahun}-${pad2(bulan)}-${pad2(hariDalamBulan)}`

  const { senarai: kehadiranBulan, loading } = useKehadiranJulat(dari, hingga)

  const { pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari } = useMemo(
    () => kiraDataRMT(kehadiranBulan),
    [kehadiranBulan]
  )

  const senaraiHari = Array.from({ length: hariDalamBulan }, (_, i) => i + 1)

  const [dataCetak, setDataCetak] = useCetak()
  const [memuatkanCetak, setMemuatkanCetak] = useState(false)
  const [memuatkanExcel, setMemuatkanExcel] = useState(false)

  function janaAOA(k) {
    const senaraiHariBulan = Array.from({ length: k.hariDalamBulan }, (_, idx) => idx + 1)
    const header = ['Bil', 'Nama Murid', 'Jantina', 'Kelas', ...senaraiHariBulan.map(String)]
    const baris = k.pelajar.map((p, idx) => [
      idx + 1,
      p.nama,
      p.jantina === 'LELAKI' ? 'L' : p.jantina === 'PEREMPUAN' ? 'P' : '-',
      p.namaKelas,
      ...senaraiHariBulan.map((h) => (p.tick[h] === true ? '/' : p.tick[h] === false ? '0' : '')),
    ])
    const jumlahTH = ['', '', '', 'Jumlah Tidak Hadir', ...senaraiHariBulan.map((h) => k.jumlahTakHadirIkutHari[h] ?? '')]
    const jumlahH = ['', '', '', 'Jumlah Hadir', ...senaraiHariBulan.map((h) => k.jumlahHadirIkutHari[h] ?? '')]
    return [header, ...baris, jumlahTH, jumlahH]
  }

  function excelBulanIni() {
    const aoa = janaAOA({ tahun, bulan, hariDalamBulan, pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari })
    muatTurunXlsx(`Papan-RMT-${NAMA_BULAN[bulan - 1]}-${tahun}.xlsx`, [{ namaHelaian: `${NAMA_BULAN[bulan - 1]} ${tahun}`, aoa }])
  }

  async function excelTahunPenuh() {
    setMemuatkanExcel(true)
    try {
      const helaianSenarai = []
      for (let b = 1; b <= 12; b++) {
        const hariDlmBulanNi = bilanganHariDalamBulan(tahun, b)
        const dariB = `${tahun}-${pad2(b)}-01`
        const hinggaB = `${tahun}-${pad2(b)}-${pad2(hariDlmBulanNi)}`
        const kehadiranB = await ambilKehadiranJulat(dariB, hinggaB)
        const dataB = kiraDataRMT(kehadiranB)
        if (dataB.pelajar.length > 0) {
          helaianSenarai.push({
            namaHelaian: NAMA_BULAN[b - 1],
            aoa: janaAOA({ tahun, bulan: b, hariDalamBulan: hariDlmBulanNi, ...dataB }),
          })
        }
      }
      if (helaianSenarai.length === 0) {
        window.alert('Tiada rekod RMT untuk tahun ni langsung.')
        return
      }
      muatTurunXlsx(`Papan-RMT-${tahun}-Tahun-Penuh.xlsx`, helaianSenarai)
    } finally {
      setMemuatkanExcel(false)
    }
  }

  function cetakBulanIni() {
    setDataCetak([{ tahun, bulan, hariDalamBulan, pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari }])
  }

  async function cetakTahunPenuh() {
    setMemuatkanCetak(true)
    try {
      const semuaBulan = []
      for (let b = 1; b <= 12; b++) {
        const hariDlmBulanNi = bilanganHariDalamBulan(tahun, b)
        const dariB = `${tahun}-${pad2(b)}-01`
        const hinggaB = `${tahun}-${pad2(b)}-${pad2(hariDlmBulanNi)}`
        const kehadiranB = await ambilKehadiranJulat(dariB, hinggaB)
        const { pelajar: pelajarB, jumlahHadirIkutHari: hadirB, jumlahTakHadirIkutHari: takHadirB } = kiraDataRMT(kehadiranB)
        if (pelajarB.length > 0) {
          semuaBulan.push({ tahun, bulan: b, hariDalamBulan: hariDlmBulanNi, pelajar: pelajarB, jumlahHadirIkutHari: hadirB, jumlahTakHadirIkutHari: takHadirB })
        }
      }
      if (semuaBulan.length === 0) {
        window.alert('Tiada rekod RMT untuk tahun ni langsung.')
        return
      }
      setDataCetak(semuaBulan)
    } finally {
      setMemuatkanCetak(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <select
          value={bulan}
          onChange={(e) => setBulan(Number(e.target.value))}
          className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {NAMA_BULAN.map((b, i) => (
            <option key={b} value={i + 1}>{b}</option>
          ))}
        </select>
        <select
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={cetakBulanIni} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
          <Printer size={14} /> Cetak Bulan Ini
        </button>
        <button onClick={cetakTahunPenuh} disabled={memuatkanCetak} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60">
          <Printer size={14} /> {memuatkanCetak ? 'Memuatkan…' : 'Cetak Tahun Penuh'}
        </button>
        <button onClick={excelBulanIni} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
          <FileSpreadsheet size={14} /> Excel Bulan Ini
        </button>
        <button onClick={excelTahunPenuh} disabled={memuatkanExcel} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60">
          <FileSpreadsheet size={14} /> {memuatkanExcel ? 'Memuatkan…' : 'Excel Tahun Penuh'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : pelajar.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod RMT untuk {NAMA_BULAN[bulan - 1]} {tahun} lagi.</p>
      ) : (
        <div className="overflow-auto border border-border rounded-card max-h-[75vh]">
          <table className="text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-base">
              <tr>
                <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>Bil</th>
                <th className="sticky z-30 bg-base text-left px-2 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.nama, width: LEBAR.nama }}>Nama Murid</th>
                <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.jantina, width: LEBAR.jantina }}>Jantina</th>
                <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>Kelas</th>
                {senaraiHari.map((h) => {
                  const iso = `${tahun}-${pad2(bulan)}-${pad2(h)}`
                  const hari = namaHari(iso)
                  const hujungMinggu = hari === 'Sabtu' || hari === 'Ahad'
                  return (
                    <th
                      key={h}
                      className={`px-1.5 py-2 font-semibold text-center border-b border-border w-8 ${
                        hujungMinggu ? 'bg-[#F1EFE8] text-inkmuted' : 'text-ink'
                      }`}
                    >
                      <div>{h}</div>
                      <div className="text-[9px] font-normal">{SINGKATAN_HARI[hari]}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pelajar.map((p, i) => (
                <tr key={p.idMurid}>
                  <td className="sticky z-10 bg-surface text-center px-1 py-2 border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>{i + 1}</td>
                  <td className="sticky z-10 bg-surface px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink" style={{ left: KIRI.nama, width: LEBAR.nama }}>{p.nama}</td>
                  <td className="sticky z-10 bg-surface text-center px-1 py-2 border-r border-border text-inkmuted" style={{ left: KIRI.jantina, width: LEBAR.jantina }}>{p.jantina === 'LELAKI' ? 'L' : p.jantina === 'PEREMPUAN' ? 'P' : '-'}</td>
                  <td className="sticky z-10 bg-surface px-2 py-2 border-r border-border whitespace-nowrap text-inkmuted" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>{p.namaKelas}</td>
                  {senaraiHari.map((h) => {
                    const status = p.tick[h] // true = hadir, false = tak hadir (RMT tapi tak hadir), undefined = tiada data
                    return (
                      <td key={h} className="text-center px-1.5 py-2">
                        {status === true && <span style={{ color: '#27500A' }} className="font-bold">/</span>}
                        {status === false && <span className="text-brand-red font-bold">0</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-base">
              <tr>
                <td colSpan={4} className="sticky left-0 z-10 bg-base px-2 py-2 font-semibold text-ink border-t border-r border-border" style={{ minWidth: LEBAR.bil + LEBAR.nama + LEBAR.jantina + LEBAR.kelas }}>
                  Jumlah Tidak Hadir
                </td>
                {senaraiHari.map((h) => (
                  <td key={h} className="text-center px-1.5 py-2 font-semibold text-brand-red border-t border-border">
                    {jumlahTakHadirIkutHari[h] ?? ''}
                  </td>
                ))}
              </tr>
              <tr>
                <td colSpan={4} className="sticky left-0 z-10 bg-base px-2 py-2 font-semibold text-ink border-t border-r border-border">
                  Jumlah Hadir
                </td>
                {senaraiHari.map((h) => (
                  <td key={h} className="text-center px-1.5 py-2 font-semibold text-ink border-t border-border">
                    {jumlahHadirIkutHari[h] ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-inkmuted mt-3">
        / = hadir (RMT hari tu) · 0 = RMT tapi tak hadir · petak kosong = tiada data / bukan RMT hari tu (contoh: berubah ke Asrama)
      </p>

      {dataCetak && <CetakPapanRMT kumpulan={dataCetak} />}
    </div>
  )
}
