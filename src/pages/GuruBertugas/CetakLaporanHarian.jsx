import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import KadStatistikCetak from '../../components/cetak/KadStatistikCetak.jsx'
import SenaraiBulletCetak from '../../components/cetak/SenaraiBulletCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

function Seksyen({ tajuk, teks }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-bold uppercase mb-1.5">{tajuk}:</p>
      <p className="text-sm whitespace-pre-wrap">{teks || '-'}</p>
    </div>
  )
}

export default function CetakLaporanHarian({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((l, i) => (
        <div key={l.id} className={`p-10 text-black text-sm ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan Harian" />

          <div className="grid grid-cols-3 gap-2 mb-5">
            <p><span className="font-bold">MINGGU: </span>{l.minggu}</p>
            <p><span className="font-bold">HARI: </span>{l.hari?.toUpperCase()}</p>
            <p><span className="font-bold">TARIKH: </span>{l.tarikh}</p>
          </div>

          <KadStatistikCetak
            senarai={[
              { label: 'Kehadiran Guru', nilai: `${l.jumlahGuruHadir} / ${l.jumlahGuruKeseluruhan}` },
              { label: `Kehadiran Murid (${l.peratusKehadiranMurid}%)`, nilai: `${l.jumlahMuridHadir} / ${l.jumlahMuridKeseluruhan}` },
            ]}
          />

          <Seksyen
            tajuk={`Guru Bertugas${l.kumpulanBertugasNama ? ` (${l.kumpulanBertugasNama})` : ''}`}
            teks={(l.senaraiGuruBertugas ?? []).map((g) => g.nama).join(', ')}
          />
          <Seksyen tajuk="PPM Bertugas" teks={(l.senaraiPPMBertugas ?? []).map((p) => p.nama).join(', ')} />

          <SenaraiBulletCetak
            tajuk="Rumusan Guru Mangkir"
            senarai={(l.rumusanGuruMangkir ?? []).map((r) => `${r.nama} - ${r.sebab}`)}
          />
          <SenaraiBulletCetak
            tajuk="Rumusan Murid Sakit/Pulang Awal"
            senarai={(l.rumusanMuridSakit ?? []).map((r) => `${r.nama} - ${r.sebab} (${r.tindakan})`)}
          />

          <Seksyen tajuk="Laporan PDPC" teks={l.laporanPDPC} />
          {l.kokurikulumAktif && <Seksyen tajuk="Kokurikulum Minggu Ini" teks={l.butiranKokurikulum || 'Ya'} />}
          <Seksyen tajuk="Laporan Pagi" teks={l.laporanPagi} />
          <Seksyen tajuk="Hal-Hal Lain" teks={l.halLain} />

          <p className="text-sm mt-6"><span className="font-bold">Dilaporkan Oleh: </span>{l.dilaporkanOleh}</p>
        </div>
      ))}
    </PrintArea>
  )
}
