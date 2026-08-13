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

export default function CetakLaporanHarian({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((l, i) => (
        <div key={l.id} className={`p-10 text-black text-sm ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan Harian" />

          <div className="grid grid-cols-2 gap-2 mb-4">
            <p><strong>Minggu:</strong> {l.minggu}</p>
            <p><strong>Tarikh:</strong> {l.tarikh} ({l.hari})</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 border border-black rounded p-2">
            <p><strong>Kehadiran Guru:</strong> {l.jumlahGuruHadir} / {l.jumlahGuruKeseluruhan}</p>
            <p><strong>Kehadiran Murid:</strong> {l.jumlahMuridHadir} / {l.jumlahMuridKeseluruhan} ({l.peratusKehadiranMurid}%)</p>
          </div>

          <Seksyen
            tajuk={`Guru Bertugas${l.kumpulanBertugasNama ? ` (${l.kumpulanBertugasNama})` : ''}`}
            teks={(l.senaraiGuruBertugas ?? []).map((g) => g.nama).join(', ')}
          />
          <Seksyen tajuk="PPM Bertugas" teks={(l.senaraiPPMBertugas ?? []).map((p) => p.nama).join(', ')} />
          <Seksyen
            tajuk="Rumusan Guru Mangkir"
            teks={(l.rumusanGuruMangkir ?? []).map((r) => `${r.nama} - ${r.sebab}`).join('\n')}
          />
          <Seksyen
            tajuk="Rumusan Murid Sakit/Pulang Awal"
            teks={(l.rumusanMuridSakit ?? []).map((r) => `${r.nama} - ${r.sebab} (${r.tindakan})`).join('\n')}
          />
          <Seksyen tajuk="Laporan PDPC" teks={l.laporanPDPC} />
          {l.kokurikulumAktif && <Seksyen tajuk="Kokurikulum Minggu Ini" teks={l.butiranKokurikulum || 'Ya'} />}
          <Seksyen tajuk="Laporan Pagi" teks={l.laporanPagi} />
          <Seksyen tajuk="Hal-Hal Lain" teks={l.halLain} />

          <RuangTandatangan senarai={[l.dilaporkanOleh || 'Dilaporkan Oleh', 'Disemak Oleh']} />
        </div>
      ))}
    </PrintArea>
  )
}
