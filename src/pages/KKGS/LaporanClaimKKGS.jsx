import PrintArea from '../../components/cetak/PrintArea.jsx'
import { warnaImbuhan } from './kkgsConstants.js'

const WARNA_STATUS_CETAK = {
  menunggu: 'Menunggu',
  diluluskan: 'Selesai',
  ditolak: 'Ditolak',
}

const TAJUK_JENIS = {
  imbuhan: 'Claim (Imbuhan)',
  resit: 'Resit',
  sumbangan: 'Sumbangan',
}

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

function butiran(c) {
  if (c.jenisClaim === 'imbuhan') return c.jenisImbuhan
  if (c.jenisClaim === 'sumbangan') {
    return c.arahSumbangan === 'masuk'
      ? `Masuk drpd ${c.ahliNama}${c.kepadaSiapa ? ` (untuk ${c.kepadaSiapa})` : ''}`
      : `Keluar kepada ${c.ahliNama}`
  }
  return c.tujuan || '-'
}

function namaBerkenaan(c) {
  return c.ahliNama || c.pemohonNama || '-'
}

// Laporan Claim/Resit/Sumbangan - jadual boleh cetak/PDF, senang kongsi
// dengan Jawatankuasa/pihak luar. senarai (dah ditapis ikut jenis+tahun
// SEBELUM hantar ke komponen ni).
//
// Column "Program/Aktiviti" HANYA relevan untuk jenis 'resit' (borang
// Resit wajibkan pilih Program/Aktiviti). Imbuhan & Sumbangan tak pernah
// isi medan ni langsung - dulu column ni tetap dipaparkan untuk semua
// jenis dan sentiasa tunjuk "-" untuk Imbuhan/Sumbangan, mengelirukan.
export default function LaporanClaimKKGS({ senarai, jenis, tahun, tapisImbuhan }) {
  const jumlahBesar = senarai.reduce((j, c) => j + c.jumlah, 0)
  const adaProgram = jenis === 'resit'
  const jumlahLajur = adaProgram ? 6 : 5

  return (
    <PrintArea>
      <div className="text-black p-10" style={{ width: '210mm', minHeight: '150mm' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-lg font-extrabold uppercase">Laporan {TAJUK_JENIS[jenis] ?? 'Tuntutan'} KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
          <p className="text-xs font-semibold mt-1">Bagi Tahun: {tahun}{tapisImbuhan ? ` — Jenis Imbuhan: ${tapisImbuhan}` : ''}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Rekod</p>
            <p className="text-base font-bold">{senarai.length}</p>
          </div>
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Keseluruhan</p>
            <p className="text-base font-bold">RM {jumlahBesar.toFixed(2)}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-[10px] mb-8">
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 24 }}>Bil</th>
              <th className="border border-black p-1.5 bg-gray-100">Nama</th>
              <th className="border border-black p-1.5 bg-gray-100">Butiran</th>
              {adaProgram && <th className="border border-black p-1.5 bg-gray-100">Program/Aktiviti</th>}
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 70 }}>Jumlah (RM)</th>
              <th className="border border-black p-1.5 bg-gray-100" style={{ width: 60 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {senarai.length === 0 ? (
              <tr><td colSpan={jumlahLajur} className="border border-black p-3 text-center text-gray-500">Tiada rekod tahun ini.</td></tr>
            ) : (
              senarai.map((c, i) => (
                <tr key={c.id}>
                  <td className="border border-black p-1.5 text-center">{i + 1}</td>
                  <td className="border border-black p-1.5">{namaBerkenaan(c)}</td>
                  <td className="border border-black p-1.5">
                    {c.jenisClaim === 'imbuhan' ? (
                      <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: warnaImbuhan(c.jenisImbuhan).bg, color: warnaImbuhan(c.jenisImbuhan).teks }}>{butiran(c)}</span>
                    ) : butiran(c)}
                  </td>
                  {adaProgram && <td className="border border-black p-1.5">{c.programNama || '-'}</td>}
                  <td className="border border-black p-1.5 text-right">{c.jumlah.toFixed(2)}</td>
                  <td className="border border-black p-1.5 text-center">{WARNA_STATUS_CETAK[c.status] ?? c.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold">Setiausaha / Bendahari KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
