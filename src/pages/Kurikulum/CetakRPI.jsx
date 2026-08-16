import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { KOD_SEKOLAH, NAMA_SEKOLAH, PROGRAM_PK_OPTIONS } from './rpiConstants.js'

// Label dengan nombor item RASMI borang KPM (BPKHAS/RPI/SR/2023) - dikekalkan
// sama supaya guru/PPD boleh terus rujuk silang dengan borang kertas asal
// (cth: "sila lengkapkan item 21").
function Baris({ no, label, nilai }) {
  return (
    <tr>
      <td className="border border-black px-2 py-1.5 font-bold align-top w-1/4">{no}. {label}</td>
      <td className="border border-black px-2 py-1.5 align-top">{nilai || '\u00A0'}</td>
    </tr>
  )
}

function TandaProgram(kunci, program) {
  return kunci === program ? '\u2713' : ''
}

const HURUF = ['a', 'b', 'c', 'd']

export default function CetakRPI({ senarai }) {
  return (
    <PrintArea>
      {senarai.map((r, i) => (
        <div key={r.id} className={`p-10 text-black text-xs ${i < senarai.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Rancangan Pendidikan Individu (RPI)" />
          <p className="text-center font-bold mb-4">MURID BERKEPERLUAN PENDIDIKAN KHAS SEKOLAH RENDAH</p>

          <p className="font-bold underline mb-2">BAHAGIAN A (Maklumat Diri)</p>
          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top w-1/4">1. Kod Sekolah</td>
                <td className="border border-black px-2 py-1.5 align-top w-1/4">{KOD_SEKOLAH}</td>
                <td className="border border-black px-2 py-1.5 font-bold align-top w-1/4">2. Tahun</td>
                <td className="border border-black px-2 py-1.5 align-top w-1/4">{r.tahunSesi}</td>
              </tr>
              <Baris no={3} label="Nama Sekolah" nilai={NAMA_SEKOLAH} />
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top" colSpan={4}>
                  4. Program Pendidikan Khas:{' '}
                  {PROGRAM_PK_OPTIONS.map((p, pi) => (
                    <span key={p.kunci} className="mr-4 font-normal">
                      {HURUF[pi]}) [{TandaProgram(p.kunci, r.program)}] {p.label}
                    </span>
                  ))}
                </td>
              </tr>
              <Baris no={5} label="Nama Murid" nilai={r.muridNama} />
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top" colSpan={4}>6. Tarikh Lahir: {r.tarikhLahir || '\u00A0'}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">7. Umur</td>
                <td className="border border-black px-2 py-1.5 align-top">{r.umur}</td>
                <td className="border border-black px-2 py-1.5 font-bold align-top">8. Kelas</td>
                <td className="border border-black px-2 py-1.5 align-top">{r.kelas}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">9. Kategori</td>
                <td className="border border-black px-2 py-1.5 align-top">{r.kategori}</td>
                <td className="border border-black px-2 py-1.5 font-bold align-top">10. Diagnosis</td>
                <td className="border border-black px-2 py-1.5 align-top">{r.diagnosis}</td>
              </tr>
              <Baris no={11} label="Pengetahuan Sedia Ada" nilai={r.pengetahuanSediaAda} />
              <Baris no={12} label="Keupayaan" nilai={r.keupayaan} />
              <Baris no={13} label="Keperluan Perubatan" nilai={r.keperluanPerubatan} />
              <Baris no={14} label="Keperluan Perkhidmatan Sokongan" nilai={r.keperluanPerkhidmatanSokongan} />
              <Baris no={15} label="Keperluan Alat Sokongan" nilai={r.keperluanAlatSokongan} />
            </tbody>
          </table>

          <p className="font-bold underline mb-2">BAHAGIAN B (Fokus RPI)</p>
          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <Baris no={16} label="Kurikulum yang Diikuti" nilai={r.kurikulumDiikuti} />
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold align-top">17. Fokus RPI</td>
                <td className="border border-black px-2 py-1.5 align-top">
                  a) [{r.fokusKefungsian ? '\u2713' : ''}] Kefungsian &nbsp;&nbsp; b) [{r.fokusAkademik ? '\u2713' : ''}] Akademik
                </td>
              </tr>
              <Baris no={18} label="Cabaran Utama" nilai={r.cabaranUtama} />
              <Baris no={19} label="Matlamat Jangka Panjang" nilai={r.matlamatJangkaPanjang} />
            </tbody>
          </table>

          {(r.intervensi ?? []).map((blok, bi) => (
            <table key={bi} className="w-full border-collapse border border-black mb-4">
              <thead>
                <tr>
                  <th className="border border-black px-2 py-1.5 w-1/4">20. Matlamat Jangka Pendek</th>
                  <th className="border border-black px-2 py-1.5 w-2/5">21. Strategi Intervensi</th>
                  <th className="border border-black px-2 py-1.5">22. Pencapaian</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-2 align-top whitespace-pre-wrap">{blok.matlamatJangkaPendek || '\u00A0'}</td>
                  <td className="border border-black px-2 py-2 align-top whitespace-pre-wrap">
                    {blok.strategiLangkah && <p className="whitespace-pre-wrap mb-2">{blok.strategiLangkah}</p>}
                    {blok.bahanAlatan && <p className="mb-1"><span className="font-bold">Cadangan Bahan/Alatan:</span><br />{blok.bahanAlatan}</p>}
                    {blok.penilaian && <p className="mb-1"><span className="font-bold">Penilaian:</span><br />{blok.penilaian}</p>}
                    {blok.catatan && <p><span className="font-bold">Catatan:</span><br />{blok.catatan}</p>}
                  </td>
                  <td className="border border-black px-2 py-2 align-top">
                    {(blok.pencapaian ?? []).length === 0 ? '\u00A0' : (
                      blok.pencapaian.map((p, pi) => (
                        <div key={pi} className="mb-2">
                          <p className="font-bold">{p.tarikhDari}{p.tarikhHingga ? `–${p.tarikhHingga}` : ''}</p>
                          <p className="whitespace-pre-wrap">{p.catatan}</p>
                        </div>
                      ))
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          ))}

          <table className="w-full border-collapse border border-black mb-6">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1.5 font-bold w-1/4">23. Tarikh Mula</td>
                <td className="border border-black px-2 py-1.5 w-1/4">{r.tarikhMula}</td>
                <td className="border border-black px-2 py-1.5 font-bold w-1/4">24. Tarikh Semak</td>
                <td className="border border-black px-2 py-1.5 w-1/4">{r.tarikhSemak}</td>
              </tr>
              <Baris no={25} label="Keputusan IMKPK (Murid Tahun 6)" nilai={r.imkpk} />
            </tbody>
          </table>

          <p className="font-bold underline mb-3">BAHAGIAN C (Perakuan)</p>

          <p className="font-bold mb-1">26. Tarikh Sidang Pertama: {r.sidangPertama?.tarikh || '\u00A0'}</p>
          <div className="grid grid-cols-2 gap-8 mb-6 mt-6">
            <div>
              <p className="border-t border-black pt-1">( {r.sidangPertama?.namaIbuBapa || ''} )</p>
              <p className="text-center text-[10px]">a) Tandatangan Ibu Bapa/Penjaga</p>
            </div>
            <div>
              <p className="border-t border-black pt-1">( {r.sidangPertama?.namaGuru || ''} )</p>
              <p className="text-center text-[10px]">b) Tandatangan Guru</p>
            </div>
            <div className="mt-6">
              <p className="border-t border-black pt-1">( {r.sidangPertama?.disemakOleh || ''} )</p>
              <p className="text-center text-[10px]">c) Disemak Oleh</p>
            </div>
            <div className="mt-6">
              <p className="border-t border-black pt-1">( {r.sidangPertama?.disahkanOleh || ''} )</p>
              <p className="text-center text-[10px]">d) Disahkan Oleh</p>
            </div>
          </div>

          <p className="font-bold mb-1">27. Tarikh Sidang Penilaian: {r.sidangPenilaian?.tarikh || '\u00A0'}</p>
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <p className="border-t border-black pt-1">( {r.sidangPenilaian?.namaIbuBapa || ''} )</p>
              <p className="text-center text-[10px]">a) Tandatangan Ibu Bapa/Penjaga</p>
            </div>
            <div>
              <p className="border-t border-black pt-1">( {r.sidangPenilaian?.namaGuru || ''} )</p>
              <p className="text-center text-[10px]">b) Tandatangan Guru</p>
            </div>
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
