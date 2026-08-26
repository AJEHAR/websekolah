import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAMA_BULAN, NAMA_HARI_PENDEK, senaraiTarikhDalamBulan, acaraPadaTarikh } from './kalendarUtils.js'

const HARI_INI_ISO = new Date().toISOString().slice(0, 10)

// Format jadual bulanan - satu baris satu tarikh, satu lajur satu unit
// (dinamik ikut senaraiUnit sebenar, bukan dikunci 4 sahaja - sekolah
// boleh tambah unit/panitia lain). Sesuai untuk rujukan/cetakan penuh
// sebulan sekali pandang.
export default function PaparanJadual({ tahun, bulan, senaraiAcara, senaraiUnit, unitAktif, onTukarBulan, onKlikTarikh, onKlikAcara }) {
  const tarikhSenarai = senaraiTarikhDalamBulan(tahun, bulan)
  const unitDipaparkan = senaraiUnit.filter((u) => unitAktif.has(u.id))

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

      <p className="sm:hidden text-center text-[10px] text-inkmuted py-1.5 px-3 border-b border-border">Jadual penuh lebih sesuai desktop/cetak. Guna mod Hari/Minggu/Bulan untuk paparan ringkas di telefon.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-base">
              <th className="text-left px-3 py-2 font-semibold text-ink whitespace-nowrap sticky left-0 z-10 bg-base" style={{ width: 56 }}>Tarikh</th>
              <th className="text-left px-3 py-2 font-semibold text-ink whitespace-nowrap sticky z-10 bg-base" style={{ left: 56 }}>Hari</th>
              {unitDipaparkan.map((u) => (
                <th key={u.id} className="text-left px-3 py-2 font-semibold whitespace-nowrap" style={{ color: u.warna }}>
                  {u.namaUnit}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tarikhSenarai.map((iso) => {
              const [, , hStr] = iso.split('-')
              const isHariIni = iso === HARI_INI_ISO
              const namaHari = NAMA_HARI_PENDEK[new Date(iso).getDay()]
              return (
                <tr key={iso} className={isHariIni ? 'bg-[#FCEBEB]' : undefined}>
                  <td
                    onClick={() => onKlikTarikh(iso)}
                    className={`px-3 py-2 font-medium whitespace-nowrap cursor-pointer sticky left-0 z-10 ${isHariIni ? 'bg-[#FCEBEB] text-brand-red' : 'bg-surface text-ink'}`}
                    style={{ width: 56 }}
                  >
                    {Number(hStr)}
                  </td>
                  <td
                    className={`px-3 py-2 whitespace-nowrap sticky z-10 ${isHariIni ? 'bg-[#FCEBEB] text-brand-red font-medium' : 'bg-surface text-inkmuted'}`}
                    style={{ left: 56 }}
                  >
                    {namaHari}
                  </td>
                  {unitDipaparkan.map((u) => {
                    const acaraSel = acaraPadaTarikh(senaraiAcara, iso).filter((a) => a.unitId === u.id)
                    return (
                      <td key={u.id} className="px-3 py-2">
                        {acaraSel.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => onKlikAcara(a)}
                            className="block text-left text-white px-1.5 py-0.5 rounded mb-1 last:mb-0 truncate max-w-[160px]"
                            style={{ backgroundColor: a.warna }}
                            title={a.tajuk}
                          >
                            {a.tajuk}
                          </button>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
