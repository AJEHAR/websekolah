import PrintArea from '../../components/cetak/PrintArea.jsx'

function Butiran({ label, nilai }) {
  return (
    <tr>
      <td className="py-1 pr-3 text-black align-top whitespace-nowrap font-semibold" style={{ width: '38%' }}>{label}</td>
      <td className="py-1 text-black align-top">: {nilai || '-'}</td>
    </tr>
  )
}

// Satu sijil = satu muka surat (bukan jadual ringkas macam Daftar Masuk) -
// dokumen formal untuk diserahkan kepada murid/ibu bapa, bukan rekod
// dalaman sekolah sahaja.
export default function CetakSijilTamat({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((r, i) => (
        <div
          key={r.id}
          className={`p-10 text-black ${i < senarai.length - 1 ? 'print-page-break' : ''}`}
          style={{ border: '3px double black', margin: '10mm', minHeight: '250mm' }}
        >
          <div className="text-center mb-8">
            <img src="/logo-cetak.png" alt="Logo Sekolah" className="h-20 mx-auto object-contain mb-2" />
            <p className="text-base font-bold uppercase">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
            <p className="text-xs mt-0.5">Indera Mahkota 2, 25200 Kuantan, Pahang.</p>
            <p className="text-2xl font-bold uppercase tracking-wide mt-4">Sijil Tamat Persekolahan</p>
            <p className="text-xs mt-1">Bil: {r.bilangan} · Tahun Tamat {r.tahunTamat}</p>
          </div>

          <p className="text-sm text-black leading-relaxed mb-6 text-justify">
            Adalah disahkan bahawa <strong>{r.nama}</strong>, No. Kad Pengenalan <strong>{r.noKP}</strong>,
            merupakan murid <strong>Darjah {r.darjah}</strong> ({r.kelas}) di sekolah ini, telah tamat
            persekolahan pada <strong>{r.tarikhKeluarSekolah || '-'}</strong>.
          </p>

          <table className="w-full text-sm mb-8">
            <tbody>
              <Butiran label="Tarikh Lahir" nilai={r.tarikhLahir} />
              <Butiran label="No. Surat Beranak" nilai={r.noSuratBeranak} />
              <Butiran label="No. Pendaftaran" nilai={r.noPendaftaran} />
              <Butiran label="Tarikh Masuk Sekolah" nilai={r.tarikhMasukSekolah} />
              <Butiran label="Nama Ibu Bapa/Penjaga" nilai={r.namaPenjaga} />
              <Butiran label="Sebab Berhenti" nilai={r.sebabBerhenti} />
              <Butiran label="Jumlah Kehadiran" nilai={r.jumlahKehadiran} />
              <Butiran label="Kelakuan" nilai={r.kelakuan} />
              <Butiran label="Unit Beruniform" nilai={r.unitBeruniform} />
              <Butiran label="Kelab" nilai={r.kelab} />
              <Butiran label="Sukan" nilai={r.sukan} />
            </tbody>
          </table>

          <div className="flex justify-end mt-16">
            <div className="text-center w-64">
              <div className="border-b border-black mb-1" style={{ height: '50px' }}></div>
              <p className="text-sm text-black">Tandatangan & Cop Rasmi</p>
              <p className="text-xs text-black mt-0.5">Guru Besar</p>
            </div>
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
