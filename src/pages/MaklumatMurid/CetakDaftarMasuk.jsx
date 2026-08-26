import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

const LAJUR = [
  'Bil.', 'Tarikh Masuk', 'Nama', 'Jantina', 'Bangsa', 'Agama', 'No. Kad Pengenalan',
  'Tarikh Diperanakkan', 'Bil. Surat Beranak', 'Tempat Diperanakkan', 'Darjah',
  'No. Kebenaran', 'Nama Penjaga', 'Persaudaraan', 'Pekerjaan', 'Alamat', 'Sekolah Dahulu',
]

// Cetakan landskap - satu jadual besar semua rekod (SEMUA medan SNAPSHOT
// terus dari rekod - tiada lagi pergantungan pada rekod Murid semasa).
export default function CetakDaftarMasuk({ senarai }) {
  return (
    <PrintArea>
      <div className="cetak-landskap p-8 text-black">
        <KepalaSuratCetak tajukLaporan="Daftar Masuk Murid" />
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr>
              {LAJUR.map((l) => (
                <th key={l} className="border border-black px-1.5 py-1 bg-gray-100 font-bold whitespace-nowrap">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {senarai.map((r) => (
              <tr key={r.id}>
                <td className="border border-black px-1.5 py-1 text-center">{r.bilangan}</td>
                <td className="border border-black px-1.5 py-1 whitespace-nowrap">{r.tarikhMasuk || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.nama}</td>
                <td className="border border-black px-1.5 py-1">{r.jantina || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.bangsa || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.agama || '-'}</td>
                <td className="border border-black px-1.5 py-1 whitespace-nowrap">{r.noPengenalan || '-'}</td>
                <td className="border border-black px-1.5 py-1 whitespace-nowrap">{r.tarikhLahir || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.bilanganSuratBeranak || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.tempatDiperanakkan || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.darjah || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.noKebenaran || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.namaPenjaga || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.persaudaraan || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.pekerjaan || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.alamat || '-'}</td>
                <td className="border border-black px-1.5 py-1">{r.sekolahDahulu || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrintArea>
  )
}
