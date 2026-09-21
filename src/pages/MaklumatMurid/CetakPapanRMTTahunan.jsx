import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

const SINGKATAN_BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']

// data: { tahun, pelajar, jumlahBulanKeseluruhan, jumlahBesar }
// Ringkasan jumlah HARI HADIR setiap murid RMT ikut bulan (bukan tick
// harian) - 1 muka surat sahaja.
export default function CetakPapanRMTTahunan({ data }) {
  const bulanSenarai = Array.from({ length: 12 }, (_, i) => i + 1)
  return (
    <PrintArea>
      <div className="cetak-landskap p-8 text-black">
        <KepalaSuratCetak tajukLaporan={`Jumlah Kehadiran RMT Tahunan — ${data.tahun}`} />

        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              <th className="border border-black px-1 py-1 w-6">Bil</th>
              <th className="border border-black px-1 py-1 text-left w-36">Nama Murid</th>
              <th className="border border-black px-1 py-1 w-20">Kelas</th>
              {bulanSenarai.map((b) => (
                <th key={b} className="border border-black px-1 py-1 w-8">{SINGKATAN_BULAN[b - 1]}</th>
              ))}
              <th className="border border-black px-1 py-1 w-10">Jumlah Setahun</th>
            </tr>
          </thead>
          <tbody>
            {data.pelajar.map((p, idx) => (
              <tr key={p.idMurid}>
                <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                <td className="border border-black px-1 py-0.5 whitespace-nowrap">{p.nama}</td>
                <td className="border border-black px-1 py-0.5 whitespace-nowrap">{p.namaKelas}</td>
                {bulanSenarai.map((b) => (
                  <td key={b} className="border border-black text-center px-0.5 py-0.5">{p.hadirBulan[b] ?? '-'}</td>
                ))}
                <td className="border border-black text-center px-0.5 py-0.5 font-bold">{p.jumlahSetahun}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="border border-black px-1 py-1 font-bold">Jumlah Keseluruhan</td>
              {bulanSenarai.map((b) => (
                <td key={b} className="border border-black text-center px-0.5 py-1 font-bold">{data.jumlahBulanKeseluruhan[b] ?? ''}</td>
              ))}
              <td className="border border-black text-center px-0.5 py-1 font-bold">{data.jumlahBesar}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PrintArea>
  )
}
