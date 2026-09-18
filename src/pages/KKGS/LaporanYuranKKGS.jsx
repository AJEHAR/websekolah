import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_BULAN, labelStatusKeahlian } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Simbol ringkas setiap bulan (jadual print - ruang terhad, TIADA warna
// bila cetak b/w) - "-" = di luar tempoh keahlian ahli tu untuk tahun ni
// (SAMA maksud dengan legend paparan skrin), kosong = belum bayar lagi.
function simbolBulan(peruntukan, bulan) {
  const entri = peruntukan.bulanList.find((b) => b.bulan === bulan)
  if (!entri) return '-'
  if (entri.status === 'penuh') return '✓'
  if (entri.status === 'separuh') return entri.jumlah.toFixed(0)
  return ''
}

function BarisCetak({ a, i, peruntukan, senaraiBulan }) {
  return (
    <tr>
      <td className="border border-black p-1 text-center">{i + 1}</td>
      <td className="border border-black p-1">{a.nama}</td>
      {senaraiBulan.map((b) => (
        <td key={b} className="border border-black p-1 text-center">{simbolBulan(peruntukan, b)}</td>
      ))}
      <td className="border border-black p-1 text-right">{peruntukan.jumlahDibayar.toFixed(0)}</td>
      <td className="border border-black p-1 text-center">{peruntukan.lengkapPenuh ? 'Lunas' : peruntukan.jumlahDibayar > 0 ? 'Sebahagian' : 'Belum'}</td>
    </tr>
  )
}

// Laporan Pembayaran Bulanan Ahli KKGS - status yuran SETIAP ahli SETIAP
// bulan dalam satu jadual, boleh cetak/PDF untuk simpanan/semakan
// Jawatankuasa. baris (dah disediakan komponen induk): array
// {ahli, peruntukan} - HANYA ahli yang DISERTAKAN papan tahun ni (roster),
// diasingkan Aktif vs Bersara/Pindah/Berhenti macam paparan skrin.
export default function LaporanYuranKKGS({ tahun, tetapan, senaraiBulan, barisAktif, barisTakAktif }) {
  const semuaBaris = [...barisAktif, ...barisTakAktif]
  const jumlahKutipan = semuaBaris.reduce((j, r) => j + r.peruntukan.jumlahDibayar, 0)
  const bilanganLunas = semuaBaris.filter((r) => r.peruntukan.lengkapPenuh).length

  return (
    <PrintArea>
      {/* cetak-landskap - jadual banyak lajur bulan (10-12) tak muat A4
          potret, guna A4 landskap (rujuk @page landskap dalam index.css). */}
      <div className="cetak-landskap text-black p-8" style={{ minHeight: '150mm' }}>
        <div className="text-center mb-5 border-b-2 border-black pb-3">
          <p className="text-lg font-extrabold uppercase">Pembayaran Bulanan Ahli KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
          <p className="text-xs font-semibold mt-1">Bagi Tahun: {tahun} · RM{tetapan.yuranBulanan}/bulan × {tetapan.bilanganBulan} bulan</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="border border-black p-2 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Ahli Dalam Papan</p>
            <p className="text-base font-bold">{semuaBaris.length}</p>
          </div>
          <div className="border border-black p-2 text-center">
            <p className="text-[10px] text-gray-600">Ahli Lunas Penuh</p>
            <p className="text-base font-bold">{bilanganLunas} / {semuaBaris.length}</p>
          </div>
          <div className="border border-black p-2 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Kutipan Setakat Ini</p>
            <p className="text-base font-bold">RM {jumlahKutipan.toFixed(2)}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-[9px] mb-6">
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              <th className="border border-black p-1 bg-gray-100" style={{ width: 22 }}>Bil</th>
              <th className="border border-black p-1 bg-gray-100 text-left" style={{ width: 110 }}>Nama</th>
              {senaraiBulan.map((b) => (
                <th key={b} className="border border-black p-1 bg-gray-100">{NAMA_BULAN[b - 1].slice(0, 3)}</th>
              ))}
              <th className="border border-black p-1 bg-gray-100" style={{ width: 55 }}>Jumlah (RM)</th>
              <th className="border border-black p-1 bg-gray-100" style={{ width: 60 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {semuaBaris.length === 0 ? (
              <tr><td colSpan={senaraiBulan.length + 4} className="border border-black p-3 text-center text-gray-500">Tiada ahli dalam papan tahun ini.</td></tr>
            ) : (
              <>
                {barisAktif.map((r, i) => (
                  <BarisCetak key={r.ahli.id} a={r.ahli} i={i} peruntukan={r.peruntukan} senaraiBulan={senaraiBulan} />
                ))}
                {barisTakAktif.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={senaraiBulan.length + 4} className="border border-black p-1 font-bold bg-gray-50">Bersara / Pindah / Berhenti</td>
                    </tr>
                    {barisTakAktif.map((r, i) => (
                      <tr key={r.ahli.id}>
                        <td className="border border-black p-1 text-center">{i + 1}</td>
                        <td className="border border-black p-1">{r.ahli.nama} <span className="text-gray-500">({labelStatusKeahlian(r.ahli.statusKeahlian)})</span></td>
                        {senaraiBulan.map((b) => (
                          <td key={b} className="border border-black p-1 text-center">{simbolBulan(r.peruntukan, b)}</td>
                        ))}
                        <td className="border border-black p-1 text-right">{r.peruntukan.jumlahDibayar.toFixed(0)}</td>
                        <td className="border border-black p-1 text-center">{r.peruntukan.lengkapPenuh ? 'Lunas' : r.peruntukan.jumlahDibayar > 0 ? 'Sebahagian' : 'Belum'}</td>
                      </tr>
                    ))}
                  </>
                )}
              </>
            )}
          </tbody>
        </table>

        <p className="text-[9px] text-gray-600 mb-6">✓ = bulan tu lunas penuh · angka = baki dibayar bulan tu (tak cukup genap) · kosong = belum bayar · "-" = di luar tempoh keahlian ahli untuk tahun ini.</p>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
            <p className="text-xs font-semibold">Bendahari KKGS</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
