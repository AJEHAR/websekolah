import PrintArea from '../../components/cetak/PrintArea.jsx'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Cetak senarai emel & kata laluan Delima - dikumpul ikut kelas (jadual
// berasingan setiap kelas, mula muka baharu) supaya guru kelas senang
// cari & potong kertas ikut kelas masing-masing. Mod "satu kelas" pula
// terus satu jadual sahaja.
export default function CetakDelima({ kumpulanKelas, tajuk, namaSekolah }) {
  return (
    <PrintArea>
      {kumpulanKelas.map((k, idx) => (
        <div key={k.kelas} className={`text-black p-10 ${idx < kumpulanKelas.length - 1 ? 'print-page-break' : ''}`} style={{ width: '210mm' }}>
          <div className="text-center mb-5 border-b-2 border-black pb-3">
            {namaSekolah && <p className="text-sm font-bold uppercase mb-1">{namaSekolah}</p>}
            <p className="text-lg font-extrabold uppercase">Senarai Akaun DELIMa Murid</p>
            <p className="text-xs">{tajuk}</p>
            <p className="text-xs font-semibold mt-1">Kelas: {k.kelas}</p>
          </div>

          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr>
                <th className="border border-black p-1.5 bg-gray-100 w-8">Bil</th>
                <th className="border border-black p-1.5 bg-gray-100">Nama Murid</th>
                <th className="border border-black p-1.5 bg-gray-100">Emel Delima</th>
                <th className="border border-black p-1.5 bg-gray-100">Kata Laluan</th>
              </tr>
            </thead>
            <tbody>
              {k.murid.map((m, i) => (
                <tr key={m.id}>
                  <td className="border border-black p-1.5 text-center">{i + 1}</td>
                  <td className="border border-black p-1.5">{m.nama}</td>
                  <td className="border border-black p-1.5">{m.emel || '-'}</td>
                  <td className="border border-black p-1.5">{m.kataLaluan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[10px] text-gray-600 text-center mt-6">Dicetak sistem pada {tarikhHariIni()}</p>
        </div>
      ))}
    </PrintArea>
  )
}
