import { useMemo } from 'react'
import { Briefcase, Star, Sun, Stethoscope, AlertTriangle, MoreHorizontal } from 'lucide-react'
import { hariDalamTahun } from '../../lib/dateUtils.js'

// Guna sekali dengan page "Rekod Saya" (Keberadaan) - senarai & tahun
// dibekalkan oleh page induk (kongsi state penapis tahun yang sama,
// elak fetch/pilihan tahun berulang). Bukan lagi komponen berdiri sendiri
// di page Profile.
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

const R = 54
const LILIT = 2 * Math.PI * R // lilitan bulatan donut

// Sepasang cincin donut - stroke-dasharray/offset teknik SVG klasik untuk
// bahagikan bulatan ikut nisbah, bukan carta ke-3 pihak (tiada dependency
// tambahan, sepadan ringan dengan seluruh sistem).
function CincinDonut({ segmen }) {
  let offsetTerkumpul = 0
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 sm:h-44 sm:w-44 -rotate-90 shrink-0">
      <circle cx="70" cy="70" r={R} fill="none" stroke="#EDEDED" strokeWidth="16" />
      {segmen.map((s) => {
        const panjang = (s.nilai / s.jumlah) * LILIT
        const el = (
          <circle
            key={s.label}
            cx="70" cy="70" r={R} fill="none"
            stroke={s.warna} strokeWidth="16"
            strokeDasharray={`${panjang} ${LILIT - panjang}`}
            strokeDashoffset={-offsetTerkumpul}
            strokeLinecap={segmen.length > 1 ? 'butt' : 'round'}
          />
        )
        offsetTerkumpul += panjang
        return el
      })}
    </svg>
  )
}

export default function StatistikKeberadaan({ senarai, tahun, loading }) {
  const stat = useMemo(() => kiraStatistik(senarai, tahun), [senarai, tahun])

  const jenisCuti = [
    { label: 'Cuti Rehat Khas', nilai: stat.cutiRehatKhas, warna: '#D97706', Ikon: Star },
    { label: 'Cuti Rehat', nilai: stat.cutiRehat, warna: '#EA580C', Ikon: Sun },
    { label: 'Cuti Sakit', nilai: stat.cutiSakit, warna: '#DC2626', Ikon: Stethoscope },
    { label: 'Cuti Tanpa Rekod', nilai: stat.cutiTanpaRekod, warna: '#6B7280', Ikon: AlertTriangle },
    { label: 'Cuti Lain-lain', nilai: stat.cutiLain, warna: '#7C3AED', Ikon: MoreHorizontal },
  ]
  const jenisCutiAda = jenisCuti.filter((j) => j.nilai > 0)
  const segmenDonut = jenisCutiAda.map((j) => ({ ...j, jumlah: stat.jumlahCuti }))

  if (loading) {
    return <p className="text-sm text-inkmuted">Memuatkan…</p>
  }

  return (
    <div className="space-y-6">
      {/* 2 nombor besar - Rasmi & Jumlah Cuti (2 kategori berlainan, bukan
          sebahagian sama, jadi diasingkan daripada pecahan cuti di bawah). */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card p-4 flex items-center gap-3" style={{ backgroundColor: '#0F6E561A' }}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#0F6E56' }}>
            <Briefcase size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-ink leading-none">{stat.rasmi}</p>
            <p className="text-[11px] text-inkmuted mt-1">hari Rasmi</p>
          </div>
        </div>
        <div className="rounded-card p-4 flex items-center gap-3" style={{ backgroundColor: '#C8102E1A' }}>
          <div className="h-10 w-10 rounded-full bg-brand-red flex items-center justify-center shrink-0">
            <Sun size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-ink leading-none">{stat.jumlahCuti}</p>
            <p className="text-[11px] text-inkmuted mt-1">jumlah hari Cuti</p>
          </div>
        </div>
      </div>

      {/* Donut - pecahan jenis cuti */}
      {stat.jumlahCuti === 0 ? (
        <p className="text-sm text-inkmuted text-center py-6">Tiada cuti direkodkan untuk {tahun}.</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <CincinDonut segmen={segmenDonut} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-ink">{stat.jumlahCuti}</span>
              <span className="text-[10px] text-inkmuted">hari cuti</span>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 gap-2">
            {jenisCutiAda.map((j) => {
              const peratus = Math.round((j.nilai / stat.jumlahCuti) * 100)
              return (
                <div key={j.label} className="flex items-center gap-2.5 p-2 rounded-card hover:bg-base">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${j.warna}1A` }}>
                    <j.Ikon size={14} style={{ color: j.warna }} />
                  </div>
                  <span className="text-xs text-ink flex-1 min-w-0 truncate">{j.label}</span>
                  <span className="text-xs font-semibold text-ink shrink-0">{j.nilai} hari</span>
                  <span className="text-[10px] text-inkmuted w-9 text-right shrink-0">{peratus}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
