import { useMemo, useState } from 'react'
import { namaHari, bilanganHariDalamBulan } from '../../lib/dateUtils.js'
import { warnaBadge, labelRingkas } from '../Keberadaan/badgeUtils.js'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

function pad2(n) {
  return String(n).padStart(2, '0')
}

export default function KalendarBulanan({ senarai }) {
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)

  const hariDalamBulan = bilanganHariDalamBulan(tahun, bulan)

  const senaraiHari = useMemo(() => {
    return Array.from({ length: hariDalamBulan }, (_, i) => {
      const hari = i + 1
      const iso = `${tahun}-${pad2(bulan)}-${pad2(hari)}`
      const rekod = senarai.find((r) => r.tarikhMula <= iso && r.tarikhTamat >= iso)
      return { hari, iso, rekod, namaHariIni: namaHari(iso) }
    })
  }, [senarai, tahun, bulan, hariDalamBulan])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select
          value={bulan}
          onChange={(e) => setBulan(Number(e.target.value))}
          className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {NAMA_BULAN.map((b, i) => (
            <option key={b} value={i + 1}>{b}</option>
          ))}
        </select>
        <select
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="border border-border rounded-card overflow-hidden divide-y divide-border">
        {senaraiHari.map(({ hari, rekod, namaHariIni }) => {
          const hujungMinggu = namaHariIni === 'Sabtu' || namaHariIni === 'Ahad'
          const warna = rekod ? warnaBadge(rekod.urusan) : null

          return (
            <div
              key={hari}
              className="flex items-center gap-3 px-3 py-2"
              style={rekod ? { backgroundColor: warna.bg } : undefined}
            >
              <span className="text-xs font-semibold text-inkmuted w-6 shrink-0">{hari}</span>
              {rekod ? (
                <span className="text-xs font-medium truncate" style={{ color: warna.teks }}>
                  {labelRingkas(rekod)} · {rekod.tempat}
                </span>
              ) : hujungMinggu ? (
                <span className="text-xs text-inkmuted">{namaHariIni}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
