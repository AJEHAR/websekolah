import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { namaHari } from '../../lib/dateUtils.js'

function TabelBlok({ blok, rekod }) {
  return (
    <table className="w-full border-collapse border border-black text-xs mb-6">
      <colgroup>
        <col className="w-2/5" />
        <col className="w-3/5" />
      </colgroup>
      <tbody>
        <tr>
          <td className="border border-black px-2 py-1.5 font-bold align-bottom">BLOK/KAWASAN</td>
          <td className="border border-black px-2 py-1.5 text-center align-bottom">{blok.nama}</td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1.5 font-bold align-bottom">KESELAMATAN</td>
          <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanKeselamatan || ''}</td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1.5 font-bold align-bottom">KEBERSIHAN</td>
          <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanKebersihan || ''}</td>
        </tr>
        {blok.adaDisiplin && (
          <tr>
            <td className="border border-black px-2 py-1.5 font-bold align-bottom">DISIPLIN</td>
            <td className="border border-black px-2 py-1.5 align-top">{rekod?.catatanDisiplin || ''}</td>
          </tr>
        )}
        <tr>
          <td className="px-2 py-1.5 font-bold text-right" style={{ border: '1px solid white' }}>DILAPORKAN OLEH:</td>
          <td className="px-2 py-1.5" style={{ border: '1px solid white' }}>{rekod?.guru?.nama || ''}</td>
        </tr>
      </tbody>
    </table>
  )
}

// kumpulan: [{ tarikh, bloks, rekodSenarai }]
export default function CetakLaporan3K({ kumpulan }) {
  return (
    <PrintArea>
      {kumpulan.map((k, i) => (
        <div key={k.tarikh} className={`p-10 text-black text-sm ${i < kumpulan.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan 3K" />

          <p className="text-center mb-5">
            <span className="font-bold">TARIKH: </span>{k.tarikh}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="font-bold">HARI: </span>{namaHari(k.tarikh)?.toUpperCase()}
          </p>

          {k.bloks.map((b) => (
            <TabelBlok key={b.id} blok={b} rekod={k.rekodSenarai.find((r) => r.blokId === b.id)} />
          ))}
        </div>
      ))}
    </PrintArea>
  )
}
