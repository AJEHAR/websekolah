import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAMA_BULAN, NAMA_HARI_PENDEK, janaMingguDariTarikh, acaraPadaTarikh, tambahHari } from './kalendarUtils.js'

const HARI_INI_ISO = new Date().toISOString().slice(0, 10)

export default function PaparanMinggu({ tarikhAsas, senaraiAcara, unitAktif, onTukarTarikh, onKlikTarikh, onKlikAcara }) {
  const minggu = janaMingguDariTarikh(tarikhAsas)
  const acaraDitapis = senaraiAcara.filter((a) => unitAktif.has(a.unitId))

  const [t1, b1] = minggu[0].split('-').map(Number)
  const [t2, b2, h2] = minggu[6].split('-').map(Number)
  const julatLabel = b1 === b2
    ? `${Number(minggu[0].split('-')[2])}–${h2} ${NAMA_BULAN[b1 - 1]} ${t1}`
    : `${Number(minggu[0].split('-')[2])} ${NAMA_BULAN[b1 - 1]} – ${h2} ${NAMA_BULAN[b2 - 1]} ${t2}`

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <button onClick={() => onTukarTarikh(tambahHari(tarikhAsas, -7))} aria-label="Minggu lepas" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold text-ink">{julatLabel}</p>
        <button onClick={() => onTukarTarikh(tambahHari(tarikhAsas, 7))} aria-label="Minggu depan" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mobile: tatal mendatar, setiap hari lebar tetap (110px) supaya teks/chip
          senang dibaca. Desktop (sm+): 7 lajur sama rata, tiada tatal. */}
      <p className="sm:hidden text-center text-[10px] text-inkmuted py-1 border-b border-border">← Seret untuk lihat hari lain →</p>
      <div className="flex overflow-x-auto sm:overflow-visible divide-x divide-border">
        {minggu.map((iso, i) => {
          const [, , hStr] = iso.split('-')
          const acaraHariIni = acaraPadaTarikh(acaraDitapis, iso)
          const isHariIni = iso === HARI_INI_ISO
          return (
            <button
              key={iso}
              onClick={() => onKlikTarikh(iso)}
              className="flex-none w-[112px] sm:w-auto sm:flex-1 min-h-[160px] sm:min-h-[220px] p-1.5 text-left hover:bg-base align-top"
            >
              <div className={`text-center mb-2 pb-1.5 rounded-card ${isHariIni ? 'bg-tint-hujungMinggu/40' : ''}`}>
                <p className="text-[9px] text-inkmuted uppercase font-semibold">{NAMA_HARI_PENDEK[i].slice(0, 3)}</p>
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isHariIni ? 'bg-brand-red text-white' : 'text-ink'}`}>
                  {Number(hStr)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {acaraHariIni.map((a) => (
                  <span
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onKlikAcara(a) }}
                    className="text-[10px] leading-tight px-1.5 py-1 rounded text-white"
                    style={{ backgroundColor: a.warna || '#999' }}
                    title={a.tajuk}
                  >
                    {a.tajuk}
                  </span>
                ))}
                {acaraHariIni.length === 0 && (
                  <span className="text-[9px] text-inkmuted/60">Tiada acara</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
