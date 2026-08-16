import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { STRATEGI_PLC_LAJUR } from './plcConstants.js'

function BarisMaklumat({ label, nilai }) {
  return (
    <tr>
      <td className="border border-black px-2 py-1.5 font-bold w-1/4 align-top">{label}</td>
      <td className="border border-black px-2 py-1.5 align-top">{nilai || '\u00A0'}</td>
    </tr>
  )
}

export default function CetakLaporanPLC({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((l, i) => (
        <div key={l.id} className={`p-10 text-black text-xs ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan Komuniti Pembelajaran Profesional (PLC)" />

          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <BarisMaklumat label="Tajuk / Fokus" nilai={l.tajukFokus} />
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">Tarikh / Masa</td>
                <td className="border border-black px-2 py-1.5 align-top">{l.tarikh}{l.masa ? `, ${l.masa}` : ''}</td>
              </tr>
              <BarisMaklumat label="Tempat" nilai={l.tempat} />
              <BarisMaklumat label="Nama Kumpulan" nilai={l.namaKumpulan} />
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">Nama & No.KP Mentor</td>
                <td className="border border-black px-2 py-1.5 align-top">
                  {l.mentorNama ? `${l.mentorNama}${l.mentorIc ? ` (${l.mentorIc})` : ''}` : '\u00A0'}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">Nama & No.KP Ketua Kumpulan</td>
                <td className="border border-black px-2 py-1.5 align-top">
                  {l.ketuaNama ? `${l.ketuaNama}${l.ketuaIc ? ` (${l.ketuaIc})` : ''}` : '\u00A0'}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">Nama & No.KP Ahli Kumpulan</td>
                <td className="border border-black px-2 py-1.5 align-top">
                  {l.ahli?.length > 0 ? (
                    <ol className="list-decimal list-inside">
                      {l.ahli.map((a) => (
                        <li key={a.emel}>{a.nama}{a.ic ? ` (${a.ic})` : ''}</li>
                      ))}
                    </ol>
                  ) : '\u00A0'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border border-black border-t-0 -mt-4 mb-4 p-2">
            <p className="font-bold mb-2">Strategi PLC:</p>
            <div className="grid grid-cols-5 gap-2">
              {STRATEGI_PLC_LAJUR.map((lajur, li) => (
                <div key={li} className="space-y-2">
                  {lajur.map((s) => (
                    <div key={s} className="flex items-start gap-1.5">
                      <span className="inline-block w-3 h-3 border border-black shrink-0 mt-0.5 text-center leading-none text-[10px]">
                        {l.strategi?.includes(s) ? '\u2713' : ''}
                      </span>
                      <span className="italic">{s}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="font-bold mb-1.5">Butiran Perbincangan:</p>
          <table className="w-full border-collapse border border-black mb-6">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1.5 w-3/5">Catatan (Isu/Fokus/Data/Bahan Sumber)</th>
                <th className="border border-black px-2 py-1.5">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {(l.butiran?.length > 0 ? l.butiran : [{ catatan: '', tindakan: '' }]).map((b, bi) => (
                <tr key={bi}>
                  <td className="border border-black px-2 py-2 align-top whitespace-pre-wrap">{b.catatan || '\u00A0'}</td>
                  <td className="border border-black px-2 py-2 align-top whitespace-pre-wrap">{b.tindakan || '\u00A0'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 mt-10">
            <div>
              <p className="font-bold mb-8">Disediakan oleh:</p>
              <p className="border-t border-black pt-1">( {l.disediakanOleh || ''} )</p>
              <p className="mt-1">Tarikh: {l.tarikh}</p>
            </div>
            <div>
              <p className="font-bold mb-8">Disahkan oleh:</p>
              <p className="border-t border-black pt-1">( {l.disahkanOleh || ''} )</p>
              <p className="mt-1">Tarikh:</p>
            </div>
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
