import { useMemo, useState } from 'react'
import { useKeberadaanSaya } from '../../hooks/useKeberadaan.js'
import { hariDalamTahun } from '../../lib/dateUtils.js'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

// KWB sengaja dikecualikan daripada analisis ni (bukan "ketiadaan", cuma keluar sekejap).
function kiraStatistik(senarai, tahun) {
  const s = { rasmi: 0, cutiRehatKhas: 0, cutiRehat: 0, cutiSakit: 0, cutiTanpaRekod: 0, cutiLain: 0 }

  senarai.forEach((r) => {
    if (r.urusan === 'Keluar Waktu Bekerja (KWB)') return
    const hari = hariDalamTahun(r.tarikhMula, r.tarikhTamat, tahun)
    if (hari <= 0) return

    if (r.urusan === 'Rasmi') s.rasmi += hari
    else if (r.urusan === 'Cuti') {
      if (r.jenis === 'Cuti Rehat Khas') s.cutiRehatKhas += hari
      else if (r.jenis === 'Cuti Rehat') s.cutiRehat += hari
      else if (r.jenis === 'Cuti Sakit') s.cutiSakit += hari
      else if (r.jenis === 'Cuti Tanpa Rekod') s.cutiTanpaRekod += hari
      else s.cutiLain += hari
    }
  })

  s.jumlahCuti = s.cutiRehatKhas + s.cutiRehat + s.cutiSakit + s.cutiTanpaRekod + s.cutiLain
  return s
}

export default function StatistikKeberadaan({ emel }) {
  const { senarai, loading } = useKeberadaanSaya(emel)
  const [tahun, setTahun] = useState(TAHUN_SEMASA)

  const stat = useMemo(() => kiraStatistik(senarai, tahun), [senarai, tahun])

  const baris = [
    { label: 'Rasmi', nilai: stat.rasmi, warna: '#0F6E56' },
    { label: 'Cuti Rehat Khas', nilai: stat.cutiRehatKhas, warna: '#854F0B' },
    { label: 'Cuti Rehat', nilai: stat.cutiRehat, warna: '#854F0B' },
    { label: 'Cuti Sakit', nilai: stat.cutiSakit, warna: '#854F0B' },
    { label: 'Cuti Tanpa Rekod', nilai: stat.cutiTanpaRekod, warna: '#854F0B' },
    { label: 'Cuti Lain-lain', nilai: stat.cutiLain, warna: '#854F0B' },
  ]
  const maksima = Math.max(1, ...baris.map((b) => b.nilai))

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink">Analisis Keberadaan</h2>
        <select
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="h-9 px-2 rounded-card border border-border bg-surface text-xs"
        >
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <div className="space-y-2.5">
          {baris.map((b) => (
            <div key={b.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-inkmuted">{b.label}</span>
                <span className="font-semibold text-ink">{b.nilai} hari</span>
              </div>
              <div className="h-2 rounded-full bg-base overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(b.nilai / maksima) * 100}%`, backgroundColor: b.warna }}
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
            <span className="text-sm font-semibold text-ink">Jumlah Semua Cuti</span>
            <span className="text-sm font-bold text-brand-red">{stat.jumlahCuti} hari</span>
          </div>
        </div>
      )}
    </div>
  )
}
