import { Fragment } from 'react'
import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_BULAN } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Kumpul transaksi (tersusun MENAIK ikut tarikh, dgn lajur `baki` dah
// dikira sebelum sampai sini) ikut bulan - utk mod "Tahun Penuh" supaya
// laporan pecah 12 bahagian, bukan 1 jadual lurus panjang tanpa henti.
function kumpulIkutBulan(transaksi) {
  const kumpulan = {}
  transaksi.forEach((t) => {
    const b = Number((t.tarikh ?? '').slice(5, 7))
    if (!kumpulan[b]) kumpulan[b] = []
    kumpulan[b].push(t)
  })
  return Object.keys(kumpulan).map(Number).sort((a, b) => a - b).map((bulan) => ({ bulan, senarai: kumpulan[bulan] }))
}

function BarisTransaksi({ t, no }) {
  return (
    <tr>
      <td className="border border-black p-1 text-center">{no}</td>
      <td className="border border-black p-1">{t.tarikh}</td>
      <td className="border border-black p-1">{t.perkara}</td>
      <td className="border border-black p-1">{t.kategori}</td>
      <td className="border border-black p-1">{t.programNama || '-'}</td>
      <td className="border border-black p-1 text-right">{t.jenis === 'masuk' ? t.jumlah.toFixed(2) : ''}</td>
      <td className="border border-black p-1 text-right">{t.jenis === 'keluar' ? t.jumlah.toFixed(2) : ''}</td>
      <td className="border border-black p-1 text-right font-semibold">{t.baki.toFixed(2)}</td>
    </tr>
  )
}

function BarisSubtotalBulan({ bulan, senarai }) {
  const masuk = senarai.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const keluar = senarai.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  const bakiAkhirBulan = senarai[senarai.length - 1]?.baki
  return (
    <tr className="bg-gray-100 font-bold">
      <td colSpan={5} className="border border-black p-1 text-right">Jumlah {NAMA_BULAN[bulan - 1]} :</td>
      <td className="border border-black p-1 text-right">{masuk.toFixed(2)}</td>
      <td className="border border-black p-1 text-right">{keluar.toFixed(2)}</td>
      <td className="border border-black p-1 text-right">{bakiAkhirBulan?.toFixed(2)}</td>
    </tr>
  )
}

// Laporan Kewangan KKGS - gaya Buku Besar (General Ledger) boleh cetak,
// TAHUN PENUH (dipecah ikut bulan) atau SATU BULAN sahaja. Tapisan tempoh
// dibuat SEBELUM hantar ke komponen ni; `transaksi` diterima dah tersusun
// MENAIK ikut tarikh dan sudah ada lajur `baki` (baki bergerak) siap kira.
export default function LaporanKewanganKKGS({ transaksi, tahun, bulan, bakiTerkumpul, bakiAwalTahun }) {
  const jumlahMasuk = transaksi.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const jumlahKeluar = transaksi.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  const bakiBersihTempoh = jumlahMasuk - jumlahKeluar

  const kategoriMap = {}
  transaksi.forEach((t) => {
    const kunci = `${t.jenis}_${t.kategori}`
    kategoriMap[kunci] = (kategoriMap[kunci] || 0) + t.jumlah
  })
  const pecahanMasuk = Object.entries(kategoriMap).filter(([k]) => k.startsWith('masuk_')).map(([k, v]) => [k.replace('masuk_', ''), v])
  const pecahanKeluar = Object.entries(kategoriMap).filter(([k]) => k.startsWith('keluar_')).map(([k, v]) => [k.replace('keluar_', ''), v])

  const tajukPeriod = bulan ? `${NAMA_BULAN[bulan - 1]} ${tahun}` : `Tahun ${tahun}`
  const kumpulanBulan = !bulan ? kumpulIkutBulan(transaksi) : null

  // No bersambung sepanjang laporan (bukan reset setiap bulan) - macam
  // buku besar sebenar.
  let noBerjalan = 0

  return (
    <PrintArea>
      <div className="text-black p-10" style={{ width: '210mm', minHeight: '150mm' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <p className="text-lg font-extrabold uppercase">Laporan Kewangan KKGS</p>
          <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
          <p className="text-xs font-semibold mt-1">Bagi Tempoh: {tajukPeriod}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-3">
          {bakiAwalTahun != null && (
            <div className="border border-black p-3 text-center">
              <p className="text-[10px] text-gray-600">Baki Awal {bulan ? `Tahun ${tahun}` : 'Tempoh'}</p>
              <p className="text-base font-bold">RM {bakiAwalTahun.toFixed(2)}</p>
            </div>
          )}
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Masuk</p>
            <p className="text-base font-bold">RM {jumlahMasuk.toFixed(2)}</p>
          </div>
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Jumlah Keluar</p>
            <p className="text-base font-bold">RM {jumlahKeluar.toFixed(2)}</p>
          </div>
          <div className="border border-black p-3 text-center">
            <p className="text-[10px] text-gray-600">Baki Bersih Tempoh Ini</p>
            <p className="text-base font-bold">RM {bakiBersihTempoh.toFixed(2)}</p>
          </div>
        </div>
        {bakiTerkumpul != null && (
          <div className="border-2 border-black p-3 text-center mb-6 bg-gray-50">
            <p className="text-[10px] text-gray-600">Baki Terkumpul Kelab (akhir tempoh ini, merentasi semua tahun)</p>
            <p className="text-lg font-extrabold">RM {bakiTerkumpul.toFixed(2)}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold mb-2 border-b border-black pb-1">Pecahan Masuk Ikut Kategori</p>
            {pecahanMasuk.length === 0 ? <p className="text-xs text-gray-500">-</p> : pecahanMasuk.map(([kat, jum]) => (
              <div key={kat} className="flex justify-between text-xs py-0.5">
                <span>{kat}</span><span className="font-semibold">RM {jum.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold mb-2 border-b border-black pb-1">Pecahan Keluar Ikut Kategori</p>
            {pecahanKeluar.length === 0 ? <p className="text-xs text-gray-500">-</p> : pecahanKeluar.map(([kat, jum]) => (
              <div key={kat} className="flex justify-between text-xs py-0.5">
                <span>{kat}</span><span className="font-semibold">RM {jum.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-bold mb-2">Buku Besar (Ledger) - Tersusun Ikut Tarikh</p>
        <table className="w-full border-collapse border border-black text-[9px] mb-8">
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              <th className="border border-black p-1 bg-gray-100">No</th>
              <th className="border border-black p-1 bg-gray-100">Tarikh</th>
              <th className="border border-black p-1 bg-gray-100">Perkara</th>
              <th className="border border-black p-1 bg-gray-100">Kategori</th>
              <th className="border border-black p-1 bg-gray-100">Program/Aktiviti</th>
              <th className="border border-black p-1 bg-gray-100">Debit / Masuk (RM)</th>
              <th className="border border-black p-1 bg-gray-100">Kredit / Keluar (RM)</th>
              <th className="border border-black p-1 bg-gray-100">Baki (RM)</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length === 0 ? (
              <tr><td colSpan={8} className="border border-black p-2 text-center text-gray-500">Tiada transaksi tempoh ini.</td></tr>
            ) : kumpulanBulan ? (
              kumpulanBulan.map(({ bulan: b, senarai }) => (
                <Fragment key={b}>
                  <tr>
                    <td colSpan={8} className="border border-black p-1 bg-gray-200 font-bold text-center uppercase">{NAMA_BULAN[b - 1]} {tahun}</td>
                  </tr>
                  {senarai.map((t) => {
                    noBerjalan += 1
                    return <BarisTransaksi key={t.id} t={t} no={noBerjalan} />
                  })}
                  <BarisSubtotalBulan bulan={b} senarai={senarai} />
                </Fragment>
              ))
            ) : (
              transaksi.map((t) => {
                noBerjalan += 1
                return <BarisTransaksi key={t.id} t={t} no={noBerjalan} />
              })
            )}
          </tbody>
        </table>

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
