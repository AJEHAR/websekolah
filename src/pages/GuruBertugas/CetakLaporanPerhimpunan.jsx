import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

function Seksyen({ tajuk, adaTitikBertindih = true, teks }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-bold uppercase mb-1.5">{tajuk}{adaTitikBertindih ? ':' : ''}</p>
      <p className="text-sm whitespace-pre-wrap">{teks || '-'}</p>
    </div>
  )
}

export default function CetakLaporanPerhimpunan({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((l, i) => (
        <div key={l.id} className={`p-10 text-black text-sm ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan Perhimpunan Mingguan" />

          <div className="grid grid-cols-3 gap-2 mb-2">
            <p><span className="font-bold">MINGGU: </span>{l.minggu}</p>
            <p><span className="font-bold">HARI: </span>{l.hari?.toUpperCase()}</p>
            <p><span className="font-bold">TARIKH: </span>{l.tarikh}</p>
          </div>
          <p className="mb-5"><span className="font-bold">DILAPORKAN OLEH :</span> {l.dilaporkanOleh}</p>

          <Seksyen tajuk="Pendidikan Sivik" teks={l.laporanSivik} />
          <Seksyen tajuk="Ha-Hal Lain" adaTitikBertindih={false} teks={l.halLain} />

          <div className="mb-5">
            <p className="text-sm mb-1.5"><span className="font-bold uppercase">Ucapan Pentadbir: </span>{l.namaPentadbir}</p>
            <p className="text-sm whitespace-pre-wrap">{l.ucapanPentadbir || '-'}</p>
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
