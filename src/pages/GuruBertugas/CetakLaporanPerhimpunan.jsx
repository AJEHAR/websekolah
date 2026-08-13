import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

function Seksyen({ tajuk, teks }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-bold uppercase mb-1.5">{tajuk}:</p>
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
            <p><strong>MINGGU:</strong> {l.minggu}</p>
            <p><strong>HARI:</strong> {l.hari?.toUpperCase()}</p>
            <p><strong>TARIKH:</strong> {l.tarikh}</p>
          </div>
          <p className="mb-5"><strong>DILAPORKAN OLEH</strong> : {l.dilaporkanOleh}</p>

          <Seksyen tajuk="Pendidikan Sivik" teks={l.laporanSivik} />
          <Seksyen tajuk="Hal-Hal Lain" teks={l.halLain} />

          <div className="mb-5">
            <p className="text-sm font-bold uppercase mb-1.5">Ucapan Pentadbir: {l.namaPentadbir}</p>
            <p className="text-sm whitespace-pre-wrap">{l.ucapanPentadbir || '-'}</p>
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
