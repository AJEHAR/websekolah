import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAMA_BULAN, NAMA_HARI_PENDEK, janaGridBulan, acaraPadaTarikh } from './kalendarUtils.js'

const HARI_INI_ISO = new Date().toISOString().slice(0, 10)
const MAX_PAPAR_SEL = 3

export default function KalendarGrid({ tahun, bulan, senaraiAcara, unitAktif, onTukarBulan, onKlikTarikh, onKlikAcara }) {
  const grid = janaGridBulan(tahun, bulan)
  const acaraDitapis = senaraiAcara.filter((a) => unitAktif.has(a.unitId))

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <button onClick={() => onTukarBulan(-1)} aria-label="Bulan lepas" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold text-ink">{NAMA_BULAN[bulan]} {tahun}</p>
        <button onClick={() => onTukarBulan(1)} aria-label="Bulan depan" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {NAMA_HARI_PENDEK.map((h) => (
          <div key={h} className="text-center py-2 text-[10px] sm:text-xs font-semibold text-inkmuted uppercase">
            {h.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((sel) => {
          const acaraHariIni = acaraPadaTarikh(acaraDitapis, sel.iso)
          const isHariIni = sel.iso === HARI_INI_ISO
          return (
            <button
              key={sel.iso}
              onClick={() => onKlikTarikh(sel.iso)}
              className={`min-h-[64px] sm:min-h-[92px] border-b border-r border-border p-1 sm:p-1.5 text-left flex flex-col gap-0.5 hover:bg-base transition-colors ${!sel.dalamBulan ? 'bg-base/50' : ''}`}
            >
              <span className={`text-[11px] sm:text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full shrink-0 ${
                isHariIni ? 'bg-brand-red text-white' : sel.dalamBulan ? 'text-ink' : 'text-inkmuted/50'
              }`}>
                {sel.hari}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {acaraHariIni.slice(0, MAX_PAPAR_SEL).map((a) => (
                  <span
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onKlikAcara(a) }}
                    className="text-[9px] sm:text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate"
                    style={{ backgroundColor: a.warna || '#999' }}
                    title={a.tajuk}
                  >
                    {a.tajuk}
                  </span>
                ))}
                {acaraHariIni.length > MAX_PAPAR_SEL && (
                  <span className="text-[9px] text-inkmuted">+{acaraHariIni.length - MAX_PAPAR_SEL} lagi</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
