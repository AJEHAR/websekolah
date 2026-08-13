import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import RuangTandatangan from '../../components/cetak/RuangTandatangan.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

function Seksyen({ tajuk, teks }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-bold uppercase mb-1">{tajuk}</p>
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

          <div className="grid grid-cols-2 gap-2 mb-4">
            <p><strong>Minggu:</strong> {l.minggu}</p>
            <p><strong>Tarikh:</strong> {l.tarikh} ({l.hari})</p>
          </div>

          <Seksyen tajuk="Laporan Sivik" teks={l.laporanSivik} />
          <Seksyen tajuk="Hal-Hal Lain" teks={l.halLain} />
          <Seksyen tajuk="Ucapan Pentadbir" teks={l.ucapanPentadbir} />

          <RuangTandatangan senarai={[l.namaPentadbir || 'Pentadbir', l.dilaporkanOleh || 'Pelapor']} />
        </div>
      ))}
    </PrintArea>
  )
}
