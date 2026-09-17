import PrintArea from '../../components/cetak/PrintArea.jsx'
import { labelStatusProgram } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTarikh(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Laporan Program/Aktiviti KKGS - jadual boleh cetak/PDF (tahunan), senang
// kongsi dengan Jawatankuasa/pihak luar. senarai (dah ditapis ikut tahun
// SEBELUM hantar ke komponen ni) - sama corak macam LaporanClaimKKGS.jsx.
export default function LaporanProgramKKGS({ senarai, tahun }) {
  const jumlahSelesai = senarai.filter((p) => p.status === 'selesai').length
  const jumlahTangguh = senarai.filter((p) => p.status === 'tangguh').length

  return (
    <PrintArea>
      <div className="text-black p-10" style={{ width: '210mm', minHeight: '150mm' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-lg font-extrabold uppercase">Laporan Program / Aktiviti KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
          <p className="text-xs font-semibold mt-1">Bagi Tahun: {tahun}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Program</p>
            <p className="text-base font-bold">{senarai.length}</p>
          </div>
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Selesai</p>
            <p className="text-base font-bold">{jumlahSelesai}</p>
          </div>
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Tangguh</p>
            <p className="text-base font-bold">{jumlahTangguh}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-[10px] mb-8">
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 24 }}>Bil</th>
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 70 }}>Tarikh</th>
              <th className="border border-black p-1.5 bg-gray-100">Nama Program/Aktiviti</th>
              <th className="border border-black p-1.5 bg-gray-100">Catatan</th>
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 60 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {senarai.length === 0 ? (
              <tr><td colSpan={5} className="border border-black p-3 text-center text-gray-500">Tiada program tahun ini.</td></tr>
            ) : (
              senarai.map((p, i) => (
                <tr key={p.id}>
                  <td className="border border-black p-1.5 text-center">{i + 1}</td>
                  <td className="border border-black p-1.5 whitespace-nowrap">{formatTarikh(p.tarikh)}</td>
                  <td className="border border-black p-1.5">{p.nama}</td>
                  <td className="border border-black p-1.5">{p.catatan || '-'}</td>
                  <td className="border border-black p-1.5 text-center">{labelStatusProgram(p.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold">Setiausaha KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
