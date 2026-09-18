import PrintArea from '../../components/cetak/PrintArea.jsx'
import { JAWATAN_URUTAN_PILIHAN_RAYA, JAWATAN_AJK_PILIHAN_RAYA } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Laporan Keputusan Pilihan Raya KKGS - jadual boleh cetak/PDF, senang
// kongsi/gantung papan notis. Papar SETAKAT keputusan yang dah diumum
// (pusingan yang belum ditutup dipapar "Belum Diputuskan", bukan
// disorok - staff yang cetak semasa pilihan raya masih berjalan tetap
// dapat rekod jelas apa yang dah/belum selesai). "butiranPusingan"
// (senarai PENUH {calonId,undi} setiap calon) dipapar sekali kalau ada
// - laporan sesi lama (sebelum ciri ni wujud) jatuh balik papar nama
// pemenang sahaja tanpa jadual undi terperinci.
export default function LaporanPilihanRayaKKGS({ tahun, status, bilanganKerusiAjk, pemenang, butiranPusingan, cariNama }) {
  const semuaSelesai = status === 'selesai'

  return (
    <PrintArea>
      <div className="text-black p-10" style={{ width: '210mm', minHeight: '150mm' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-lg font-extrabold uppercase">Keputusan Pilihan Raya Jawatankuasa KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
          <p className="text-xs font-semibold mt-1">Bagi Tahun: {tahun}</p>
          {!semuaSelesai && <p className="text-[10px] text-gray-600 mt-1">(Keputusan setakat cetakan ni dibuat - pilihan raya MASIH belum selesai sepenuhnya)</p>}
        </div>

        <div className="space-y-4 mb-8">
          {JAWATAN_URUTAN_PILIHAN_RAYA.map((jawatan) => {
            const nilaiPemenang = pemenang[jawatan]
            const butiran = butiranPusingan?.[jawatan]
            const adalahAjk = jawatan === JAWATAN_AJK_PILIHAN_RAYA
            const kerusi = adalahAjk ? bilanganKerusiAjk : 1
            // undefined = pusingan belum ditutup lagi ("Belum diputuskan");
            // null = ditutup TAPI 0 undi (kerusi kekal kosong) - kena
            // jadi senarai KOSONG eksplisit, bukan [null], atau paparan
            // tersalah papar "🏆 (ahli dipadam)".
            const senaraiPemenangId = nilaiPemenang === undefined ? null : (nilaiPemenang === null ? [] : (Array.isArray(nilaiPemenang) ? nilaiPemenang : [nilaiPemenang]))

            return (
              <div key={jawatan} className="border border-black">
                <p className="text-xs font-extrabold uppercase bg-gray-100 px-3 py-1.5 border-b border-black">{jawatan}</p>
                <div className="p-3">
                  {senaraiPemenangId === null ? (
                    <p className="text-xs text-gray-500 italic">Belum diputuskan.</p>
                  ) : senaraiPemenangId.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Tiada calon dapat undi - kerusi kekal kosong.</p>
                  ) : (
                    <p className="text-sm font-bold mb-1">🏆 {senaraiPemenangId.map((id) => cariNama(id)).join(', ')}</p>
                  )}

                  {butiran && butiran.length > 0 && (
                    <table className="w-full border-collapse border border-black text-[10px] mt-2">
                      <thead>
                        <tr>
                          <th className="border border-black p-1 bg-gray-50 text-left">Calon</th>
                          <th className="border border-black p-1 bg-gray-50" style={{ width: 70 }}>Undi</th>
                          <th className="border border-black p-1 bg-gray-50" style={{ width: 60 }}>Keputusan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {butiran.map((b, i) => (
                          <tr key={b.calonId}>
                            <td className="border border-black p-1">{cariNama(b.calonId)}</td>
                            <td className="border border-black p-1 text-center">{b.undi}</td>
                            <td className="border border-black p-1 text-center">{i < kerusi && b.undi > 0 ? 'Menang' : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold">Pengerusi Mesyuarat / Setiausaha KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
