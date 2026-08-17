import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { gabungAlamat, darjahMurid } from './daftarMasukUtils.js'

const LAJUR = [
  'Bil.', 'Tarikh Masuk', 'Nama', 'Jantina', 'Bangsa', 'Agama', 'No. Kad Pengenalan',
  'Tarikh Diperanakkan', 'Bil. Surat Beranak', 'Tempat Diperanakkan', 'Darjah',
  'No. Kebenaran', 'Nama Penjaga', 'Persaudaraan', 'Pekerjaan', 'Alamat', 'Sekolah Dahulu',
]

// Cetakan landskap - satu jadual besar semua rekod (bukan satu murid satu
// muka surat macam RPI/PLC) - ikut format tradisional "Buku Daftar Masuk
// Murid" (satu baris = satu murid, semua lajur kelihatan sekali gus).
export default function CetakDaftarMasuk({ senarai, muridById }) {
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
            {senarai.map((r) => {
              const m = muridById[r.muridId] ?? {}
              return (
                <tr key={r.id}>
                  <td className="border border-black px-1.5 py-1 text-center">{r.bilangan}</td>
                  <td className="border border-black px-1.5 py-1 whitespace-nowrap">{m.tarikhMasukSekolah || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{r.muridNama}</td>
                  <td className="border border-black px-1.5 py-1">{m.jantina || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{m.kaum || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{m.agama || '-'}</td>
                  <td className="border border-black px-1.5 py-1 whitespace-nowrap">{m.noPengenalan || '-'}</td>
                  <td className="border border-black px-1.5 py-1 whitespace-nowrap">{m.tarikhLahir || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{r.bilanganSuratBeranak || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{r.tempatDiperanakkan || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{darjahMurid(m)}</td>
                  <td className="border border-black px-1.5 py-1">{r.noKebenaran || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{m.penjaga1Nama || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{m.penjaga1Hubungan || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{m.penjaga1Pekerjaan || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{gabungAlamat(m) || '-'}</td>
                  <td className="border border-black px-1.5 py-1">{r.sekolahDahulu || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PrintArea>
  )
}
