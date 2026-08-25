import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'

const SEKSYEN_CETAK = [
  ['1.0 PENGENALAN / LATAR BELAKANG PROGRAM', 'seksyen1'],
  ['2.0 OBJEKTIF PROGRAM', 'seksyen2'],
  ['3.0 KUMPULAN SASARAN', 'seksyen3'],
  ['4.0 BUTIRAN PELAKSANAAN PROGRAM', 'seksyen4'],
  ['6.0 ATUR CARA PROGRAM', 'seksyen6'],
  ['7.0 IMPLIKASI KEWANGAN', 'seksyen7'],
  ['8.0 PENUTUP', 'seksyen8'],
]

function BlokTandatangan({ label, nama, jawatan, tarikh }) {
  return (
    <div>
      <p className="text-sm text-black font-semibold mb-1">{label} :</p>
      <div className="border-b border-black w-52 h-12"></div>
      <p className="text-xs text-black mt-2">Nama : {nama || '__________________'}</p>
      <p className="text-xs text-black">Jawatan : {jawatan || '__________________'}</p>
      <p className="text-xs text-black">Nama sekolah : {NAMA_SEKOLAH}</p>
      <p className="text-xs text-black">Tarikh : {tarikh || '__________________'}</p>
    </div>
  )
}

// Satu dokumen PENUH = Muka Depan (gambar tahunan) + Isi Kandungan
// (No.Ruj/Ybrs/8 seksyen/tandatangan) + Kelulusan Pengurus Sekolah
// (template tetap, tanda tangan manual) + Lampiran A (jawatankuasa).
// Ikut susunan sebenar dokumen kertas kerja rasmi KPM/sekolah.
export default function CetakKertasKerjaPenuh({ rekod, gambarMukaDepan }) {
  return (
    <PrintArea>
      {/* MUKA DEPAN */}
      <div className="relative text-black print-page-break" style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}>
        {gambarMukaDepan ? (
          <img src={gambarMukaDepan} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="text-sm text-black">(Tiada gambar muka depan untuk tahun {rekod.tahun})</p>
          </div>
        )}
        <div style={{ position: 'absolute', left: '15mm', right: '15mm', bottom: '55mm', textAlign: 'center' }}>
          <p className="text-2xl font-bold text-black leading-snug">{rekod.tajuk}</p>
          <p className="text-base text-black mt-4">{rekod.anjuran}</p>
        </div>
      </div>

      {/* ISI KANDUNGAN */}
      <div className="p-10 text-black print-page-break">
        <div className="text-right text-xs mb-4">- No. Ruj : {rekod.noRuj}</div>
        <p className="text-center text-sm font-bold uppercase mb-1">Kertas Cadangan</p>
        <p className="text-center text-base font-bold uppercase mb-1">{rekod.tajuk}</p>
        <p className="text-center text-sm uppercase mb-1">{NAMA_SEKOLAH}</p>
        <p className="text-center text-sm uppercase mb-1">Tahun {rekod.tahun}</p>
        {rekod.ybrsNama && (
          <p className="text-sm mt-4">Ybrs {rekod.ybrsJawatan ? `${rekod.ybrsJawatan} ` : ''}{rekod.ybrsNama}</p>
        )}
        <p className="text-sm font-bold uppercase border-b border-black pb-1 mt-3 mb-5">
          {rekod.tajuk}, {NAMA_SEKOLAH} TAHUN {rekod.tahun}
        </p>

        {SEKSYEN_CETAK.map(([label, kunci]) => (
          <div key={kunci} className="mb-5">
            <p className="text-sm font-bold mb-1.5">{label} :</p>
            <p className="text-sm text-black leading-relaxed whitespace-pre-line text-justify">{rekod[kunci] || '-'}</p>
          </div>
        ))}

        <div className="mb-5">
          <p className="text-sm font-bold mb-1.5">5.0 JAWATANKUASA KERJA :</p>
          <p className="text-sm text-black">5.1 Rujuk LAMPIRAN A</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-10">
          <BlokTandatangan label="Disediakan oleh" nama={rekod.disediakanNama} jawatan={rekod.disediakanJawatan} tarikh={rekod.disediakanTarikh} />
          <BlokTandatangan label="Disemak oleh" nama={rekod.disemakNama} jawatan={rekod.disemakJawatan} tarikh={rekod.disemakTarikh} />
        </div>
      </div>

      {/* KELULUSAN PENGURUS SEKOLAH */}
      <div className="p-10 text-black print-page-break">
        <div className="text-xs mb-6">No. Ruj : {rekod.noRuj}</div>
        <p className="text-sm font-bold text-center border-b border-black pb-2 mb-8">KEPUTUSAN PENGURUS SEKOLAH</p>
        <p className="text-sm text-black mb-4">
          Meluluskan Kertas Cadangan ({rekod.tajuk}, {NAMA_SEKOLAH}, Tahun {rekod.tahun}).
        </p>
        <p className="text-sm text-black mb-6">atau</p>
        <p className="text-sm text-black mb-8">
          Tidak meluluskan Kertas Cadangan ({rekod.tajuk}, {NAMA_SEKOLAH}, Tahun {rekod.tahun}).
        </p>
        <p className="text-sm font-semibold mb-2">Ulasan :</p>
        <div className="border-b border-black h-8"></div>
        <div className="border-b border-black h-8 mt-4"></div>
        <div className="border-b border-black h-8 mt-4"></div>

        <div className="mt-16 text-center w-72">
          <div className="border-b border-black h-14"></div>
          <p className="text-sm font-semibold mt-1">(NAMA PENGURUS SEKOLAH)</p>
          <p className="text-xs mt-2">Jawatan :</p>
          <p className="text-xs">Sekolah :</p>
          <p className="text-xs">Tarikh :</p>
        </div>
      </div>

      {/* LAMPIRAN A */}
      <div className="p-10 text-black">
        <p className="text-xs mb-1">No. Ruj : {rekod.noRuj}</p>
        <p className="text-sm font-bold text-center uppercase mb-1">Ahli Jawatankuasa Kerja</p>
        <p className="text-sm font-bold text-center uppercase mb-1">{rekod.tajuk}</p>
        <p className="text-sm font-bold text-center uppercase mb-6">{NAMA_SEKOLAH}, TAHUN {rekod.tahun}</p>

        {(rekod.jawatankuasaPelaksana ?? []).length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-bold uppercase mb-2">Jawatankuasa Pelaksana :</p>
            {rekod.jawatankuasaPelaksana.map((b, i) => (
              <p key={i} className="text-sm text-black">{b.jawatan} : {b.nama}</p>
            ))}
          </div>
        )}

        {(rekod.ahliJawatankuasa ?? []).length > 0 && (
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1.5 bg-gray-100 font-bold w-10">Bil</th>
                <th className="border border-black px-2 py-1.5 bg-gray-100 font-bold">AJK</th>
                <th className="border border-black px-2 py-1.5 bg-gray-100 font-bold">Bidang Tugas</th>
                <th className="border border-black px-2 py-1.5 bg-gray-100 font-bold">Alatan</th>
              </tr>
            </thead>
            <tbody>
              {rekod.ahliJawatankuasa.map((b, i) => (
                <tr key={i}>
                  <td className="border border-black px-2 py-1.5 text-center align-top">{i + 1}</td>
                  <td className="border border-black px-2 py-1.5 align-top whitespace-pre-line">
                    <span className="font-semibold">{b.ajk}</span>
                    {b.ahli && <><br />{b.ahli}</>}
                  </td>
                  <td className="border border-black px-2 py-1.5 align-top whitespace-pre-line">{b.bidangTugas}</td>
                  <td className="border border-black px-2 py-1.5 align-top whitespace-pre-line">{b.alatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PrintArea>
  )
}
