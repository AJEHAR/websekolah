import { Fragment } from 'react'
import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

const PERJUMPAAN_SENARAI = Array.from({ length: 12 }, (_, i) => i + 1)

const WARNA_KATEGORI = {
  UB: { header: '#E6F1FB', sel: '#F5FAFF' },
  K: { header: '#EAF3DE', sel: '#F7FBF2' },
  S: { header: '#FAECE7', sel: '#FDF6F3' },
}
function warnaUntuk(kod) {
  return WARNA_KATEGORI[kod] ?? { header: '#F1EFE8', sel: '#FAFAF8' }
}

// pelajar: hasil useMemo dari PapanUBKS.jsx (sudah dipivot)
export default function CetakPapanUBKS({ tahunSesi, kategoriSenarai, pelajar }) {
  return (
    <PrintArea>
      <div className="cetak-landskap p-8 text-black">
        <KepalaSuratCetak tajukLaporan={`Papan Kehadiran UBKS — Sesi ${tahunSesi}`} />

        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              <th rowSpan={2} className="border border-black px-1 py-1 w-6">Bil</th>
              <th rowSpan={2} className="border border-black px-1 py-1 text-left w-28">Nama Murid</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-14">Tahun</th>
              {kategoriSenarai.map((k) => (
                <th key={k.kod} colSpan={13} className="border border-black px-1 py-1 text-center" style={{ backgroundColor: warnaUntuk(k.kod).header }}>
                  {k.nama} ({k.kod})
                </th>
              ))}
            </tr>
            <tr>
              {kategoriSenarai.map((k) => (
                <Fragment key={k.kod}>
                  {PERJUMPAAN_SENARAI.map((pj) => (
                    <th key={`${k.kod}-${pj}`} className="border border-black px-0.5 py-1 w-4" style={{ backgroundColor: warnaUntuk(k.kod).sel }}>{pj}</th>
                  ))}
                  <th className="border border-black px-1 py-1 w-7" style={{ backgroundColor: warnaUntuk(k.kod).header }}>Jum.</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {pelajar.map((p, i) => (
              <tr key={p.idMurid}>
                <td className="border border-black px-1 py-0.5 text-center">{i + 1}</td>
                <td className="border border-black px-1 py-0.5 whitespace-nowrap">{p.nama}</td>
                <td className="border border-black px-1 py-0.5 text-center whitespace-nowrap">{p.tahunTingkatan}</td>
                {kategoriSenarai.map((k) => {
                  const data = p.ikutKategori[k.kod]
                  const warna = warnaUntuk(k.kod)
                  return (
                    <Fragment key={k.kod}>
                      {PERJUMPAAN_SENARAI.map((pj) => {
                        const status = data.unitId ? data.perjumpaanStatus[pj] : null
                        return (
                          <td key={`${k.kod}-${pj}`} className="border border-black text-center px-0.5 py-0.5" style={{ backgroundColor: warna.sel }}>
                            {status === true && '/'}
                            {status === false && '0'}
                          </td>
                        )
                      })}
                      <td className="border border-black text-center px-1 py-0.5 font-bold" style={{ backgroundColor: warna.header }}>
                        {data.unitId ? data.jumlahHadir : '-'}
                      </td>
                    </Fragment>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrintArea>
  )
}
