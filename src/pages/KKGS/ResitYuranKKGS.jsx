import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_BULAN } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Resit rasmi KKGS - dijana sistem untuk ahli yang dah bayar PENUH
// (semua bulan dalam julat 'penuh') - bukti bayaran rasmi kelab.
export default function ResitYuranKKGS({ ahli, peruntukan, tahun, tetapan }) {
  return (
    <PrintArea>
      <div className="text-black p-10" style={{ width: '210mm', minHeight: '150mm' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-lg font-extrabold uppercase">Resit Rasmi Yuran KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
        </div>

        <div className="flex justify-between text-sm mb-6">
          <p><strong>Nama:</strong> {ahli.nama}</p>
          <p><strong>Tahun:</strong> {tahun}</p>
        </div>

        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr>
              <th className="border border-black p-2 bg-gray-100">Bulan</th>
              <th className="border border-black p-2 bg-gray-100">Status</th>
              <th className="border border-black p-2 bg-gray-100">Jumlah (RM)</th>
            </tr>
          </thead>
          <tbody>
            {peruntukan.bulanList.map((b) => (
              <tr key={b.bulan}>
                <td className="border border-black p-2">{NAMA_BULAN[b.bulan - 1]}</td>
                <td className="border border-black p-2 text-center">Lunas</td>
                <td className="border border-black p-2 text-right">{tetapan.yuranBulanan.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="border border-black p-2 font-bold text-right">Jumlah Keseluruhan</td>
              <td className="border border-black p-2 font-bold text-right">RM {peruntukan.jumlahDibayar.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm mb-10">Dengan ini disahkan <strong>{ahli.nama}</strong> telah <strong>MELUNASKAN SEPENUHNYA</strong> yuran KKGS bagi tahun {tahun} ({peruntukan.bulanList.length} bulan).</p>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-600">Resit dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold">Bendahari KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
