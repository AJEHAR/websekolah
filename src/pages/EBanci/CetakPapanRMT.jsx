import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { namaHari } from '../../lib/dateUtils.js'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
const SINGKATAN_HARI = { Ahad: 'A', Isnin: 'I', Selasa: 'S', Rabu: 'R', Khamis: 'K', Jumaat: 'J', Sabtu: 'S' }

function pad2(n) {
  return String(n).padStart(2, '0')
}

// kumpulan: [{ tahun, bulan, hariDalamBulan, pelajar, jumlahHadirIkutHari, jumlahTakHadirIkutHari }]
export default function CetakPapanRMT({ kumpulan }) {
  return (
    <PrintArea>
      {kumpulan.map((k, i) => {
        const senaraiHari = Array.from({ length: k.hariDalamBulan }, (_, idx) => idx + 1)
        return (
          <div key={`${k.tahun}-${k.bulan}`} className={`cetak-landskap p-8 text-black ${i < kumpulan.length - 1 ? 'print-page-break' : ''}`}>
            <KepalaSuratCetak tajukLaporan={`Papan Kehadiran RMT — ${NAMA_BULAN[k.bulan - 1]} ${k.tahun}`} />

            <table className="w-full border-collapse text-[9px]">
              <thead>
                <tr>
                  <th className="border border-black px-1 py-1 w-6">Bil</th>
                  <th className="border border-black px-1 py-1 text-left w-32">Nama Murid</th>
                  <th className="border border-black px-1 py-1 w-8">JT</th>
                  <th className="border border-black px-1 py-1 w-20">Kelas</th>
                  {senaraiHari.map((h) => {
                    const iso = `${k.tahun}-${pad2(k.bulan)}-${pad2(h)}`
                    const hari = namaHari(iso)
                    const hujungMinggu = hari === 'Sabtu' || hari === 'Ahad'
                    return (
                      <th key={h} className="border border-black px-0.5 py-1 w-5" style={hujungMinggu ? { backgroundColor: '#EEEEEE' } : undefined}>
                        <div>{h}</div>
                        <div style={{ fontWeight: 'normal', fontSize: '7px' }}>{SINGKATAN_HARI[hari]}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {k.pelajar.map((p, idx) => (
                  <tr key={p.idMurid}>
                    <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                    <td className="border border-black px-1 py-0.5 whitespace-nowrap">{p.nama}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{p.jantina === 'LELAKI' ? 'L' : p.jantina === 'PEREMPUAN' ? 'P' : '-'}</td>
                    <td className="border border-black px-1 py-0.5 whitespace-nowrap">{p.namaKelas}</td>
                    {senaraiHari.map((h) => {
                      const status = p.tick[h]
                      return (
                        <td key={h} className="border border-black text-center px-0.5 py-0.5">
                          {status === true && '/'}
                          {status === false && '0'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="border border-black px-1 py-1 font-bold">Jumlah Tidak Hadir</td>
                  {senaraiHari.map((h) => (
                    <td key={h} className="border border-black text-center px-0.5 py-1 font-bold">{k.jumlahTakHadirIkutHari[h] ?? ''}</td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black px-1 py-1 font-bold">Jumlah Hadir</td>
                  {senaraiHari.map((h) => (
                    <td key={h} className="border border-black text-center px-0.5 py-1 font-bold">{k.jumlahHadirIkutHari[h] ?? ''}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}
    </PrintArea>
  )
}
