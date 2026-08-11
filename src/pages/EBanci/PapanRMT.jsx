import { useMemo, useState } from 'react'
import { namaHari, bilanganHariDalamBulan } from '../../lib/dateUtils.js'
import { useKehadiranJulat } from '../../hooks/useKehadiranMurid.js'

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

export default function PapanRMT() {
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)

  const hariDalamBulan = bilanganHariDalamBulan(tahun, bulan)
  const dari = `${tahun}-${pad2(bulan)}-01`
  const hingga = `${tahun}-${pad2(bulan)}-${pad2(hariDalamBulan)}`

  const { senarai: kehadiranBulan, loading } = useKehadiranJulat(dari, hingga)

  const { pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari } = useMemo(() => {
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
  }, [kehadiranBulan])

  const senaraiHari = Array.from({ length: hariDalamBulan }, (_, i) => i + 1)

  return (
    <div>
      <div className="flex gap-2 mb-5">
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
    </div>
  )
}
