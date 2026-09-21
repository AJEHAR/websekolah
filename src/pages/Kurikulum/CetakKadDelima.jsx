import PrintArea from '../../components/cetak/PrintArea.jsx'

// Cetak KAD murid (bukan jadual) - 1 muka surat = 1 kelas, kad-kad kecil
// disusun grid 2 lajur supaya senang digunting & diedarkan satu-satu
// kepada murid/ibu bapa. Setiap kad ada letterhead nama sekolah kecil +
// nama, kelas, emel & kata laluan Delima murid tu.
export default function CetakKadDelima({ kumpulanKelas, tajuk, namaSekolah }) {
  return (
    <PrintArea>
      {kumpulanKelas.map((k, idx) => (
        <div key={k.kelas} className={`text-black p-8 ${idx < kumpulanKelas.length - 1 ? 'print-page-break' : ''}`} style={{ width: '210mm' }}>
          <div className="text-center mb-4 border-b-2 border-black pb-2">
            {namaSekolah && <p className="text-sm font-bold uppercase mb-1">{namaSekolah}</p>}
            <p className="text-base font-extrabold uppercase">Kad Akses Akaun DELIMa Murid</p>
            <p className="text-xs">{tajuk}</p>
            <p className="text-xs font-semibold mt-1">Kelas: {k.kelas}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {k.murid.map((m) => (
              <div key={m.id} className="border-2 border-dashed border-black rounded p-3 break-inside-avoid">
                {namaSekolah && <p className="text-[9px] font-bold uppercase text-center text-gray-700 mb-1.5">{namaSekolah}</p>}
                <p className="text-xs font-extrabold text-center uppercase mb-0.5">Akaun DELIMa</p>
                <div className="border-t border-black my-1.5" />
                <table className="w-full text-[10px]">
                  <tbody>
                    <tr>
                      <td className="font-semibold pr-1.5 py-0.5 align-top w-14">Nama</td>
                      <td className="py-0.5">: {m.nama}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold pr-1.5 py-0.5 align-top">Kelas</td>
                      <td className="py-0.5">: {m.namaKelas || k.kelas}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold pr-1.5 py-0.5 align-top">Emel</td>
                      <td className="py-0.5 break-all">: {m.emel || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold pr-1.5 py-0.5 align-top">Kata Laluan</td>
                      <td className="py-0.5 font-mono">: {m.kataLaluan || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PrintArea>
  )
}
