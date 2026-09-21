import { useMemo, useState } from 'react'
import { Printer, FileSpreadsheet, CalendarDays, CalendarRange } from 'lucide-react'
import { namaHari, bilanganHariDalamBulan } from '../../lib/dateUtils.js'
import { useKehadiranJulat, ambilKehadiranJulat } from '../../hooks/useKehadiranMurid.js'
import { useMuridList } from '../../hooks/useMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { muatTurunXlsx } from '../../lib/xlsxExport.js'
import CetakKehadiranBulanan from './CetakKehadiranBulanan.jsx'
import CetakKehadiranTahunan from './CetakKehadiranTahunan.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
const SINGKATAN_BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
const SINGKATAN_HARI = { Ahad: 'A', Isnin: 'I', Selasa: 'S', Rabu: 'R', Khamis: 'K', Jumaat: 'J', Sabtu: 'S' }

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

// Lebar lajur tetap (px) - untuk kira offset "sticky" Bil/Nama/Jantina/Kelas
const LEBAR = { bil: 36, nama: 150, kelas: 100 }
const KIRI = {
  bil: 0,
  nama: LEBAR.bil,
  kelas: LEBAR.bil + LEBAR.nama,
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

// Pivot data kehadiran mentah -> { pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari }
// Sama macam kiraDataRMT (PapanRMT.jsx) TAPI TANPA tapisan `adalahRMT` -
// SEMUA murid yang ada rekod kehadiran dikira, bukan cuma yang RMT.
// kelasFilter (pilihan): kalau diisi, cuma kira rekod kelas tu sahaja -
// supaya jumlah hadir/tak hadir sekali cetak/excel pun betul ikut kelas
// dipilih, bukan jumlah keseluruhan sekolah.
// Setiap murid juga dikira jumlahHadirMurid/jumlahTakHadirMurid/peratus
// (kehadiran bulan tu) - dipapar sebagai lajur tambahan di hujung baris.
export function kiraDataKehadiranBulanan(kehadiranBulan, kelasFilter) {
  const rekodDitapis = kelasFilter ? kehadiranBulan.filter((r) => r.namaKelas === kelasFilter) : kehadiranBulan

  const peta = {}
  const hadirIkutHari = {}
  const takHadirIkutHari = {}

  rekodDitapis.forEach((rekod) => {
    const hari = Number(rekod.tarikh.slice(8, 10))
    rekod.senaraiMurid.forEach((m) => {
      if (!peta[m.idMurid]) {
        peta[m.idMurid] = { idMurid: m.idMurid, nama: m.nama, namaKelas: rekod.namaKelas, tick: {} }
      }
      peta[m.idMurid].tick[hari] = m.hadir
      if (m.hadir) hadirIkutHari[hari] = (hadirIkutHari[hari] ?? 0) + 1
      else takHadirIkutHari[hari] = (takHadirIkutHari[hari] ?? 0) + 1
    })
  })

  const senarai = Object.values(peta)
    .map((p) => {
      const nilai = Object.values(p.tick)
      const jumlahHadirMurid = nilai.filter((v) => v === true).length
      const jumlahTakHadirMurid = nilai.filter((v) => v === false).length
      const jumlahDirekodMurid = jumlahHadirMurid + jumlahTakHadirMurid
      const peratus = jumlahDirekodMurid > 0 ? Math.round((jumlahHadirMurid / jumlahDirekodMurid) * 100) : null
      return { ...p, jumlahHadirMurid, jumlahTakHadirMurid, peratus }
    })
    .sort((a, b) => a.namaKelas.localeCompare(b.namaKelas) || a.nama.localeCompare(b.nama))

  return { pelajar: senarai, jumlahHadirIkutHari: hadirIkutHari, jumlahTakHadirIkutHari: takHadirIkutHari }
}

// Pivot TAHUNAN - baris=murid, lajur=Jan..Dis (jumlah hari hadir bulan tu),
// + Jumlah Setahun. Guna untuk tab "Jumlah Tahunan".
export function kiraDataTahunan(kehadiranTahun, kelasFilter) {
  const rekodDitapis = kelasFilter ? kehadiranTahun.filter((r) => r.namaKelas === kelasFilter) : kehadiranTahun

  const peta = {}
  rekodDitapis.forEach((rekod) => {
    const bulan = Number(rekod.tarikh.slice(5, 7))
    rekod.senaraiMurid.forEach((m) => {
      if (!peta[m.idMurid]) {
        peta[m.idMurid] = { idMurid: m.idMurid, nama: m.nama, namaKelas: rekod.namaKelas, hadirBulan: {} }
      }
      if (m.hadir) {
        peta[m.idMurid].hadirBulan[bulan] = (peta[m.idMurid].hadirBulan[bulan] ?? 0) + 1
      }
    })
  })

  const senarai = Object.values(peta)
    .map((p) => ({ ...p, jumlahSetahun: Object.values(p.hadirBulan).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => a.namaKelas.localeCompare(b.namaKelas) || a.nama.localeCompare(b.nama))

  const jumlahBulanKeseluruhan = {}
  senarai.forEach((p) => {
    for (let b = 1; b <= 12; b++) {
      jumlahBulanKeseluruhan[b] = (jumlahBulanKeseluruhan[b] ?? 0) + (p.hadirBulan[b] ?? 0)
    }
  })
  const jumlahBesar = senarai.reduce((jumlah, p) => jumlah + p.jumlahSetahun, 0)

  return { pelajar: senarai, jumlahBulanKeseluruhan, jumlahBesar }
}

export default function KehadiranBulanan() {
  const { amaran } = useDialog()
  const { senarai: senaraiMurid } = useMuridList()
  const [tab, setTab] = useState('bulanan') // bulanan | tahunan
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tapisKelas, setTapisKelas] = useState('') // '' = semua kelas

  const senaraiKelas = useMemo(
    () => [...new Set(senaraiMurid.map((m) => m.namaKelas).filter(Boolean))].sort(),
    [senaraiMurid]
  )

  const hariDalamBulan = bilanganHariDalamBulan(tahun, bulan)
  const dari = `${tahun}-${pad2(bulan)}-01`
  const hingga = `${tahun}-${pad2(bulan)}-${pad2(hariDalamBulan)}`

  const { senarai: kehadiranBulan, loading } = useKehadiranJulat(dari, hingga)

  const { pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari } = useMemo(
    () => kiraDataKehadiranBulanan(kehadiranBulan, tapisKelas),
    [kehadiranBulan, tapisKelas]
  )

  // Data tahunan - HANYA diambil bila tab "tahunan" aktif (dari/hingga
  // kosong bila tak aktif, useKehadiranJulat terus set senarai=[] tanpa fetch).
  const { senarai: kehadiranTahun, loading: loadingTahun } = useKehadiranJulat(
    tab === 'tahunan' ? `${tahun}-01-01` : null,
    tab === 'tahunan' ? `${tahun}-12-31` : null
  )
  const { pelajar: pelajarTahunan, jumlahBulanKeseluruhan, jumlahBesar } = useMemo(
    () => kiraDataTahunan(kehadiranTahun, tapisKelas),
    [kehadiranTahun, tapisKelas]
  )

  const senaraiHari = Array.from({ length: hariDalamBulan }, (_, i) => i + 1)

  const [dataCetak, setDataCetak] = useCetak()
  const [dataCetakTahunan, setDataCetakTahunan] = useCetak()
  const [memuatkanCetak, setMemuatkanCetak] = useState(false)
  const [memuatkanExcel, setMemuatkanExcel] = useState(false)

  function janaAOA(k) {
    const senaraiHariBulan = Array.from({ length: k.hariDalamBulan }, (_, idx) => idx + 1)
    const header = ['Bil', 'Nama Murid', 'Kelas', ...senaraiHariBulan.map(String), 'Jumlah Hadir', 'Peratus (%)']
    const baris = k.pelajar.map((p, idx) => [
      idx + 1,
      p.nama,
      p.namaKelas,
      ...senaraiHariBulan.map((h) => (p.tick[h] === true ? '/' : p.tick[h] === false ? '0' : '')),
      p.jumlahHadirMurid,
      p.peratus ?? '',
    ])
    const jumlahTH = ['', '', 'Jumlah Tidak Hadir', ...senaraiHariBulan.map((h) => k.jumlahTakHadirIkutHari[h] ?? ''), '', '']
    const jumlahH = ['', '', 'Jumlah Hadir', ...senaraiHariBulan.map((h) => k.jumlahHadirIkutHari[h] ?? ''), '', '']
    return [header, ...baris, jumlahTH, jumlahH]
  }

  function excelBulanIni() {
    const aoa = janaAOA({ tahun, bulan, hariDalamBulan, pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari })
    const namaKelasFail = tapisKelas ? `-${tapisKelas.replace(/\s+/g, '')}` : ''
    muatTurunXlsx(`Kehadiran-Bulanan${namaKelasFail}-${NAMA_BULAN[bulan - 1]}-${tahun}.xlsx`, [{ namaHelaian: `${NAMA_BULAN[bulan - 1]} ${tahun}`, aoa }])
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
        const dataB = kiraDataKehadiranBulanan(kehadiranB, tapisKelas)
        if (dataB.pelajar.length > 0) {
          helaianSenarai.push({
            namaHelaian: NAMA_BULAN[b - 1],
            aoa: janaAOA({ tahun, bulan: b, hariDalamBulan: hariDlmBulanNi, ...dataB }),
          })
        }
      }
      if (helaianSenarai.length === 0) {
        await amaran('Tiada rekod kehadiran untuk tahun ni langsung.')
        return
      }
      const namaKelasFail = tapisKelas ? `-${tapisKelas.replace(/\s+/g, '')}` : ''
      muatTurunXlsx(`Kehadiran-Bulanan${namaKelasFail}-${tahun}-Tahun-Penuh.xlsx`, helaianSenarai)
    } finally {
      setMemuatkanExcel(false)
    }
  }

  function cetakBulanIni() {
    setDataCetak([{ tahun, bulan, hariDalamBulan, tapisKelas, pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari }])
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
        const { pelajar: pelajarB, jumlahHadirIkutHari: hadirB, jumlahTakHadirIkutHari: takHadirB } = kiraDataKehadiranBulanan(kehadiranB, tapisKelas)
        if (pelajarB.length > 0) {
          semuaBulan.push({ tahun, bulan: b, hariDalamBulan: hariDlmBulanNi, tapisKelas, pelajar: pelajarB, jumlahHadirIkutHari: hadirB, jumlahTakHadirIkutHari: takHadirB })
        }
      }
      if (semuaBulan.length === 0) {
        await amaran('Tiada rekod kehadiran untuk tahun ni langsung.')
        return
      }
      setDataCetak(semuaBulan)
    } finally {
      setMemuatkanCetak(false)
    }
  }

  function cetakTahunan() {
    setDataCetakTahunan({ tahun, tapisKelas, pelajar: pelajarTahunan, jumlahBulanKeseluruhan, jumlahBesar })
  }

  function excelTahunan() {
    const header = ['Bil', 'Nama Murid', 'Kelas', ...SINGKATAN_BULAN, 'Jumlah Setahun']
    const baris = pelajarTahunan.map((p, idx) => [
      idx + 1,
      p.nama,
      p.namaKelas,
      ...Array.from({ length: 12 }, (_, i) => p.hadirBulan[i + 1] ?? ''),
      p.jumlahSetahun,
    ])
    const jumlah = ['', '', 'Jumlah Keseluruhan', ...Array.from({ length: 12 }, (_, i) => jumlahBulanKeseluruhan[i + 1] ?? ''), jumlahBesar]
    const aoa = [header, ...baris, jumlah]
    const namaKelasFail = tapisKelas ? `-${tapisKelas.replace(/\s+/g, '')}` : ''
    muatTurunXlsx(`Kehadiran-Tahunan${namaKelasFail}-${tahun}.xlsx`, [{ namaHelaian: `${tahun}`, aoa }])
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-4 p-1 rounded-card bg-base w-fit">
        <button onClick={() => setTab('bulanan')} className={`flex items-center gap-1.5 h-9 px-3.5 rounded-card text-xs font-semibold ${tab === 'bulanan' ? 'bg-brand-red text-white' : 'text-inkmuted'}`}>
          <CalendarDays size={14} /> Papan Bulanan
        </button>
        <button onClick={() => setTab('tahunan')} className={`flex items-center gap-1.5 h-9 px-3.5 rounded-card text-xs font-semibold ${tab === 'tahunan' ? 'bg-brand-red text-white' : 'text-inkmuted'}`}>
          <CalendarRange size={14} /> Jumlah Tahunan
        </button>
      </div>

      {tab === 'bulanan' && (
      <>
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
        <select
          value={tapisKelas}
          onChange={(e) => setTapisKelas(e.target.value)}
          className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">Semua Kelas</option>
          {senaraiKelas.map((k) => <option key={k} value={k}>{k}</option>)}
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
        <p className="text-sm text-inkmuted">Tiada rekod kehadiran untuk {NAMA_BULAN[bulan - 1]} {tahun}{tapisKelas ? ` (${tapisKelas})` : ''} lagi.</p>
      ) : (
        <div className="overflow-auto border border-border rounded-card max-h-[75vh]">
          <table className="text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-base">
              <tr>
                <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>Bil</th>
                <th className="sticky z-30 bg-base text-left px-2 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.nama, width: LEBAR.nama }}>Nama Murid</th>
                <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>Kelas</th>
                {senaraiHari.map((h) => {
                  const iso = `${tahun}-${pad2(bulan)}-${pad2(h)}`
                  const hari = namaHari(iso)
                  const hujungMinggu = hari === 'Sabtu' || hari === 'Ahad'
                  return (
                    <th
                      key={h}
                      className={`px-1.5 py-2 font-semibold text-center border-b border-border w-8 ${
                        hujungMinggu ? 'bg-tint-hujungMinggu text-inkmuted' : 'text-ink'
                      }`}
                    >
                      <div>{h}</div>
                      <div className="text-[9px] font-normal">{SINGKATAN_HARI[hari]}</div>
                    </th>
                  )
                })}
                <th className="px-2 py-2 font-semibold text-center border-b border-l border-border whitespace-nowrap">Jumlah Hadir</th>
                <th className="px-2 py-2 font-semibold text-center border-b border-border whitespace-nowrap">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pelajar.map((p, i) => (
                <tr key={p.idMurid}>
                  <td className="sticky z-10 bg-surface text-center px-1 py-2 border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>{i + 1}</td>
                  <td className="sticky z-10 bg-surface px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink" style={{ left: KIRI.nama, width: LEBAR.nama }}>{p.nama}</td>
                  <td className="sticky z-10 bg-surface px-2 py-2 border-r border-border whitespace-nowrap text-inkmuted" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>{p.namaKelas}</td>
                  {senaraiHari.map((h) => {
                    const status = p.tick[h] // true = hadir, false = tak hadir, undefined = tiada data
                    return (
                      <td key={h} className="text-center px-1.5 py-2">
                        {status === true && <span style={{ color: '#27500A' }} className="font-bold">/</span>}
                        {status === false && <span className="text-brand-red font-bold">0</span>}
                      </td>
                    )
                  })}
                  <td className="text-center px-2 py-2 border-l border-border font-semibold text-ink whitespace-nowrap">{p.jumlahHadirMurid}</td>
                  <td className="text-center px-2 py-2 font-semibold text-ink whitespace-nowrap">{p.peratus !== null ? `${p.peratus}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-base">
              <tr>
                <td colSpan={3} className="sticky left-0 z-10 bg-base px-2 py-2 font-semibold text-ink border-t border-r border-border" style={{ minWidth: LEBAR.bil + LEBAR.nama + LEBAR.kelas }}>
                  Jumlah Tidak Hadir
                </td>
                {senaraiHari.map((h) => (
                  <td key={h} className="text-center px-1.5 py-2 font-semibold text-brand-red border-t border-border">
                    {jumlahTakHadirIkutHari[h] ?? ''}
                  </td>
                ))}
                <td className="border-t border-l border-border" />
                <td className="border-t border-border" />
              </tr>
              <tr>
                <td colSpan={3} className="sticky left-0 z-10 bg-base px-2 py-2 font-semibold text-ink border-t border-r border-border">
                  Jumlah Hadir
                </td>
                {senaraiHari.map((h) => (
                  <td key={h} className="text-center px-1.5 py-2 font-semibold text-ink border-t border-border">
                    {jumlahHadirIkutHari[h] ?? ''}
                  </td>
                ))}
                <td className="border-t border-l border-border" />
                <td className="border-t border-border" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-inkmuted mt-3">
        / = hadir · 0 = tak hadir · petak kosong = tiada data (cth. belum diisi guru kelas hari tu) · Jumlah Hadir &amp; % dikira drpd hari yang ADA rekod sahaja
      </p>

      {dataCetak && <CetakKehadiranBulanan kumpulan={dataCetak} />}
      </>
      )}

      {tab === 'tahunan' && (
      <>
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <select
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={tapisKelas}
          onChange={(e) => setTapisKelas(e.target.value)}
          className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">Semua Kelas</option>
          {senaraiKelas.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={cetakTahunan} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
          <Printer size={14} /> Cetak
        </button>
        <button onClick={excelTahunan} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
          <FileSpreadsheet size={14} /> Excel
        </button>
      </div>

      {loadingTahun ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : pelajarTahunan.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod kehadiran untuk tahun {tahun}{tapisKelas ? ` (${tapisKelas})` : ''} lagi.</p>
      ) : (
        <div className="overflow-auto border border-border rounded-card">
          <table className="text-xs border-collapse w-full">
            <thead className="sticky top-0 z-10 bg-base">
              <tr>
                <th className="px-1 py-2 font-semibold text-ink border-b border-r border-border w-8">Bil</th>
                <th className="text-left px-2 py-2 font-semibold text-ink border-b border-r border-border">Nama Murid</th>
                <th className="px-2 py-2 font-semibold text-ink border-b border-r border-border">Kelas</th>
                {SINGKATAN_BULAN.map((b) => (
                  <th key={b} className="px-1.5 py-2 font-semibold text-center text-ink border-b border-border w-10">{b}</th>
                ))}
                <th className="px-2 py-2 font-semibold text-center text-ink border-b border-l border-border whitespace-nowrap">Jumlah Setahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pelajarTahunan.map((p, i) => (
                <tr key={p.idMurid}>
                  <td className="text-center px-1 py-2 border-r border-border">{i + 1}</td>
                  <td className="px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink">{p.nama}</td>
                  <td className="px-2 py-2 border-r border-border whitespace-nowrap text-inkmuted">{p.namaKelas}</td>
                  {Array.from({ length: 12 }, (_, idx) => idx + 1).map((b) => (
                    <td key={b} className="text-center px-1.5 py-2 text-ink">{p.hadirBulan[b] ?? '-'}</td>
                  ))}
                  <td className="text-center px-2 py-2 border-l border-border font-bold text-ink whitespace-nowrap">{p.jumlahSetahun}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-base">
              <tr>
                <td colSpan={3} className="px-2 py-2 font-semibold text-ink border-t border-r border-border">Jumlah Keseluruhan</td>
                {Array.from({ length: 12 }, (_, idx) => idx + 1).map((b) => (
                  <td key={b} className="text-center px-1.5 py-2 font-semibold text-ink border-t border-border">{jumlahBulanKeseluruhan[b] ?? ''}</td>
                ))}
                <td className="text-center px-2 py-2 border-t border-l border-border font-bold text-ink">{jumlahBesar}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-inkmuted mt-3">
        Setiap sel = bilangan hari hadir murid tu untuk bulan berkenaan · "-" = tiada rekod kehadiran bulan tu
      </p>

      {dataCetakTahunan && <CetakKehadiranTahunan data={dataCetakTahunan} />}
      </>
      )}
    </div>
  )
}
