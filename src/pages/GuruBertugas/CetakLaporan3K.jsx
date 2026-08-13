import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { namaHari } from '../../lib/dateUtils.js'

function TabelBlok({ blok, rekod }) {
  return (
    <div className="mb-5">
      <table className="w-full border-collapse border border-black text-xs">
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1.5 font-bold w-36 align-top">BLOK/KAWASAN</td>
            <td className="border border-black px-2 py-1.5 text-center">{blok.nama}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1.5 font-bold align-top">KESELAMATAN</td>
            <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanKeselamatan || ''}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1.5 font-bold align-top">KEBERSIHAN</td>
            <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanKebersihan || ''}</td>
          </tr>
          {blok.adaDisiplin && (
            <tr>
              <td className="border border-black px-2 py-1.5 font-bold align-top">DISIPLIN</td>
              <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanDisiplin || ''}</td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs font-bold mt-1.5">DILAPORKAN OLEH: {rekod?.guru?.nama || '-'}</p>
    </div>
  )
}

// kumpulan: [{ tarikh, bloks, rekodSenarai }]
export default function CetakLaporan3K({ kumpulan }) {
  return (
    <PrintArea>
      {kumpulan.map((k, i) => (
        <div key={k.tarikh} className={`p-10 text-black text-sm ${i < kumpulan.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan 3K" />

          <div className="flex gap-10 mb-5">
            <p><strong>TARIKH:</strong> {k.tarikh}</p>
            <p><strong>HARI:</strong> {namaHari(k.tarikh)?.toUpperCase()}</p>
          </div>

          {k.bloks.map((b) => (
            <TabelBlok key={b.id} blok={b} rekod={k.rekodSenarai.find((r) => r.blokId === b.id)} />
          ))}
        </div>
      ))}
    </PrintArea>
  )
}
