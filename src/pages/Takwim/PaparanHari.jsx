import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { NAMA_BULAN, NAMA_HARI_PENDEK, acaraPadaTarikh, tambahHari } from './kalendarUtils.js'

const HARI_INI_ISO = new Date().toISOString().slice(0, 10)

export default function PaparanHari({ tarikh, senaraiAcara, unitAktif, onTukarTarikh, onKlikTarikh, onKlikAcara }) {
  const [t, b, h] = tarikh.split('-').map(Number)
  const namaHari = NAMA_HARI_PENDEK[new Date(t, b - 1, h).getDay()]
  const acaraHariIni = acaraPadaTarikh(senaraiAcara.filter((a) => unitAktif.has(a.unitId)), tarikh)
    .sort((x, y) => (x.masa || '').localeCompare(y.masa || ''))

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <button onClick={() => onTukarTarikh(tambahHari(tarikh, -1))} aria-label="Hari lepas" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-ink">{namaHari}, {h} {NAMA_BULAN[b - 1]} {t}</p>
          {tarikh === HARI_INI_ISO && <p className="text-[10px] text-brand-red font-semibold">HARI INI</p>}
        </div>
        <button onClick={() => onTukarTarikh(tambahHari(tarikh, 1))} aria-label="Hari depan" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="p-3">
        {acaraHariIni.length === 0 ? (
          <button onClick={() => onKlikTarikh(tarikh)} className="w-full py-10 text-center text-sm text-inkmuted hover:bg-base rounded-card">
            Tiada acara pada hari ini — tekan untuk tambah
          </button>
        ) : (
          <>
            <div className="space-y-2 mb-3">
              {acaraHariIni.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onKlikAcara(a)}
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
              onClick={() => onKlikTarikh(tarikh)}
              className="w-full flex items-center justify-center gap-1.5 h-11 rounded-card border border-dashed border-border text-sm font-semibold text-inkmuted hover:text-ink hover:border-ink"
            >
              <Plus size={15} /> Tambah Acara Lain Pada Hari Ni
            </button>
          </>
        )}
      </div>
    </div>
  )
}
