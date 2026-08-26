import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react'
import { NAMA_BULAN, NAMA_HARI_PENDEK, janaGridBulan, acaraPadaTarikh } from './kalendarUtils.js'

const HARI_INI_ISO = new Date().toISOString().slice(0, 10)
const MAX_PAPAR_SEL = 3

export default function KalendarGrid({ tahun, bulan, senaraiAcara, unitAktif, onTukarBulan, onKlikTarikh, onKlikAcara }) {
  const grid = janaGridBulan(tahun, bulan)
  const acaraDitapis = senaraiAcara.filter((a) => unitAktif.has(a.unitId))
  const [selDibuka, setSelDibuka] = useState(null) // { iso, hari } - hari sesak, tunjuk senarai penuh

  const acaraHariDibuka = selDibuka ? acaraPadaTarikh(acaraDitapis, selDibuka.iso) : []

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
        {NAMA_HARI_PENDEK.map((h, i) => (
          <div key={h} className={`text-center py-2 text-[10px] sm:text-xs font-semibold uppercase ${i === 0 || i === 6 ? 'text-inkmuted/70' : 'text-inkmuted'}`}>
            {h.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((sel) => {
          const acaraHariIni = acaraPadaTarikh(acaraDitapis, sel.iso)
          const isHariIni = sel.iso === HARI_INI_ISO
          const lebihan = acaraHariIni.length - MAX_PAPAR_SEL
          return (
            <div
              key={sel.iso}
              role="button"
              tabIndex={0}
              onClick={() => onKlikTarikh(sel.iso)}
              onKeyDown={(e) => { if (e.key === 'Enter') onKlikTarikh(sel.iso) }}
              className={`min-h-[68px] sm:min-h-[96px] border-b border-r border-border p-1 sm:p-1.5 text-left flex flex-col gap-0.5 hover:bg-base transition-colors cursor-pointer ${!sel.dalamBulan ? 'bg-base/50' : ''}`}
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
                    className="text-[9px] sm:text-[10px] leading-tight px-1 py-[3px] rounded text-white truncate"
                    style={{ backgroundColor: a.warna || '#999' }}
                    title={a.tajuk}
                  >
                    {a.tajuk}
                  </span>
                ))}
                {lebihan > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelDibuka({ iso: sel.iso, hari: sel.hari }) }}
                    className="text-[9px] text-inkmuted font-semibold text-left hover:text-ink hover:underline"
                  >
                    +{lebihan} lagi
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selDibuka && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setSelDibuka(null)}>
          <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-sm max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-ink">{selDibuka.hari} {NAMA_BULAN[bulan]} {tahun}</p>
              <button onClick={() => setSelDibuka(null)} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {acaraHariDibuka.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setSelDibuka(null); onKlikAcara(a) }}
                  className="w-full flex items-start gap-3 p-3 rounded-card border border-border hover:bg-base text-left"
                >
                  <span className="h-3 w-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: a.warna }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{a.tajuk}</p>
                    <p className="text-xs text-inkmuted mt-0.5">{[a.unitNama, a.masa].filter(Boolean).join(' · ')}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => { const iso = selDibuka.iso; setSelDibuka(null); onKlikTarikh(iso) }}
              className="w-full flex items-center justify-center gap-1.5 h-11 rounded-card border border-border text-sm font-semibold text-ink"
            >
              <Plus size={15} /> Tambah Acara Pada Hari Ni
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
