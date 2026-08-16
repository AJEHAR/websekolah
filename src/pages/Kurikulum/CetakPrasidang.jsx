import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

function Seksyen({ tajuk, teks }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-bold uppercase mb-1">{tajuk}:</p>
      <p className="text-sm whitespace-pre-wrap">{teks || '-'}</p>
    </div>
  )
}

export default function CetakPrasidang({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((p, i) => (
        <div key={p.id} className={`p-10 text-black text-sm ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Borang Rumusan Prasidang" />

          <p className="mb-2"><span className="font-bold">Nama Murid: </span>{p.muridNama}</p>
          <p className="mb-5"><span className="font-bold">Kelas: </span>{p.kelas}</p>

          <Seksyen tajuk="Keupayaan Murid" teks={p.keupayaanMurid} />
          <Seksyen tajuk="Cabaran Utama" teks={p.cabaranUtama} />
          <Seksyen tajuk="Matlamat" teks={p.matlamat} />
          <Seksyen tajuk="Cadangan Strategi" teks={p.cadanganStrategi} />
        </div>
      ))}
    </PrintArea>
  )
}
