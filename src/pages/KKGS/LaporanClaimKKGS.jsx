import PrintArea from '../../components/cetak/PrintArea.jsx'
import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
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
// dengan Jawatankuasa/pihak luar. senarai (dah ditapis ikut jenis+tahun+
// imbuhan SEBELUM hantar ke komponen ni).
//
// Column "Program/Aktiviti" HANYA relevan untuk jenis 'resit' (borang
// Resit wajibkan pilih Program/Aktiviti). Imbuhan & Sumbangan tak pernah
// isi medan ni langsung - dulu column ni tetap dipaparkan untuk semua
// jenis dan sentiasa tunjuk "-" untuk Imbuhan/Sumbangan, mengelirukan.
export default function LaporanClaimKKGS({ senarai, jenis, tahun, tapisImbuhan, namaPengerusi }) {
  // (c.jumlah || 0) - elak NaN kalau ada rekod lama/rosak tiada medan
  // jumlah, yang akan buat SELURUH jumlah keseluruhan jadi "RM NaN".
  const jumlahBesar = senarai.reduce((j, c) => j + (c.jumlah || 0), 0)
  const adaProgram = jenis === 'resit'
  const jumlahLajur = adaProgram ? 6 : 5

  return (
    <PrintArea>
      {/* flex-col + minHeight 297mm (1 muka A4 penuh) supaya footer/ruang
          tandatangan di bawah TERPAKSA turun ke PALING BAWAH muka surat
          (mt-auto) bila kandungan jadual pendek - bukan terapung sejurus
          lepas jadual macam dulu. Kalau kandungan panjang (>1 muka),
          overflow biasa (pecah muka surat baharu) - footer tetap muncul
          SEKALI sahaja, di hujung SEMUA kandungan. */}
      <div className="text-black p-10 flex flex-col" style={{ width: '210mm', minHeight: '297mm' }}>
        <div>
          <KepalaSuratCetak tajukLaporan={`Laporan ${TAJUK_JENIS[jenis] ?? 'Tuntutan'} KKGS`} />
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
            <p className="text-xs font-semibold mt-1">Bagi Tahun: {tahun}{tapisImbuhan ? ` — Jenis Imbuhan: ${tapisImbuhan}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border border-black p-3 text-center">
              <p className="text-[10px] text-gray-600">Jumlah Rekod</p>
              <p className="text-base font-bold" style={{ color: '#000' }}>{senarai.length}</p>
            </div>
            <div className="border border-black p-3 text-center">
              <p className="text-[10px] text-gray-600">Jumlah Keseluruhan</p>
              <p className="text-base font-bold" style={{ color: '#000' }}>RM {jumlahBesar.toFixed(2)}</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[10px]">
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
                      {/* PENTING: TAK guna backgroundColor di sini - warna
                          latar dalam sel <table> tak boleh dipercayai
                          bila cetak/save PDF merentasi pelayar (hilang
                          senyap walaupun print-color-adjust:exact dah
                          diset - berbeza dgn warna latar pada <div> biasa
                          yang selamat, cth. CetakLaporanUBKS.jsx). Guna
                          WARNA TEKS + jalur pinggir kiri sebagai ganti -
                          dua-dua ni SENTIASA cetak, tak terjejas langsung
                          oleh tetapan "cetak latar belakang" pelayar. */}
                      {c.jenisClaim === 'imbuhan' ? (
                        <span
                          className="font-bold pl-1.5"
                          style={{ color: warnaImbuhan(c.jenisImbuhan).teks, borderLeft: `3px solid ${warnaImbuhan(c.jenisImbuhan).teks}` }}
                        >
                          {butiran(c)}
                        </span>
                      ) : butiran(c)}
                    </td>
                    {adaProgram && <td className="border border-black p-1.5">{c.programNama || '-'}</td>}
                    <td className="border border-black p-1.5 text-right" style={{ color: '#000' }}>{(c.jumlah || 0).toFixed(2)}</td>
                    <td className="border border-black p-1.5 text-center" style={{ color: '#000' }}>{WARNA_STATUS_CETAK[c.status] ?? c.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* mt-auto - dorong footer ni ke bawah SEKALI, kekal di bahagian
            bawah div (mengisi baki ruang selepas kandungan atas). */}
        <div className="flex justify-between items-end mt-auto pt-8">
          <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold" style={{ color: '#000' }}>{namaPengerusi || '……………………………………'}</p>
            <p className="text-xs font-semibold" style={{ color: '#000' }}>Pengerusi KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
