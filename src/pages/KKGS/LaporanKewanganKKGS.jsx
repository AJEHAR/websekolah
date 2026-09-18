import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_BULAN } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Kumpul transaksi (tersusun MENAIK ikut tarikh, dgn lajur `baki` dah
// dikira sebelum sampai sini) ikut SEMUA 12 BULAN (Januari-Disember) -
// SENTIASA 12 kumpulan walaupun sesetengah bulan tiada transaksi langsung
// (fix - dulu bulan kosong terus "hilang" dari laporan Tahun Penuh,
// kelirukan semakan sebab struktur laporan jadi tak konsisten sepanjang
// tahun; sekarang setiap bulan tetap ada halaman sendiri).
function kumpul12Bulan(transaksi, bakiAwalTahun) {
  const kumpulan = Array.from({ length: 12 }, (_, i) => ({ bulan: i + 1, senarai: [] }))
  transaksi.forEach((t) => {
    const b = Number((t.tarikh ?? '').slice(5, 7))
    if (b >= 1 && b <= 12) kumpulan[b - 1].senarai.push(t)
  })
  let bakiSebelum = bakiAwalTahun
  return kumpulan.map((k) => {
    const bakiAwalBulan = bakiSebelum
    const bakiAkhirBulan = k.senarai.length > 0 ? k.senarai[k.senarai.length - 1].baki : bakiAwalBulan
    bakiSebelum = bakiAkhirBulan
    return { ...k, bakiAwalBulan, bakiAkhirBulan }
  })
}

function KotakRingkas({ label, nilai }) {
  return (
    <div className="border border-black p-3 text-center">
      <p className="text-[10px] text-gray-600">{label}</p>
      <p className="text-base font-bold">RM {nilai.toFixed(2)}</p>
    </div>
  )
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

function FooterLaporan() {
  return (
    <div className="flex justify-between items-end mt-8">
      <p className="text-xs text-gray-600">Laporan dijana sistem pada {tarikhHariIni()}</p>
      <div className="text-center">
        <div className="w-48 border-b border-black mb-1" style={{ height: '40px' }} />
        <p className="text-xs font-semibold">Bendahari KKGS</p>
      </div>
    </div>
  )
}

// Halaman 1 - "sampul" ringkasan keseluruhan tempoh (jumlah besar +
// pecahan kategori). `akanBersambung` = ada halaman lepas ni (page-break
// selepas, guna kelas print-page-break sedia ada dlm index.css).
function HalamanRingkasan({ tajukPeriod, labelBakiAwal, jumlahMasuk, jumlahKeluar, bakiBersihTempoh, bakiAwalTempoh, bakiTerkumpul, pecahanMasuk, pecahanKeluar, akanBersambung }) {
  return (
    <div className={`text-black p-10 ${akanBersambung ? 'print-page-break' : ''}`} style={{ width: '210mm', minHeight: '287mm' }}>
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <p className="text-lg font-extrabold uppercase">Laporan Kewangan KKGS</p>
        <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
        <p className="text-xs font-semibold mt-1">Bagi Tempoh: {tajukPeriod}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        {bakiAwalTempoh != null && <KotakRingkas label={labelBakiAwal} nilai={bakiAwalTempoh} />}
        <KotakRingkas label="Jumlah Masuk" nilai={jumlahMasuk} />
        <KotakRingkas label="Jumlah Keluar" nilai={jumlahKeluar} />
        <KotakRingkas label="Baki Bersih Tempoh Ini" nilai={bakiBersihTempoh} />
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

      {!akanBersambung && <FooterLaporan />}
    </div>
  )
}

// Satu halaman PENUH bagi SATU bulan - jadual sendiri, ringkasan mini
// sendiri, sentiasa dipaparkan walaupun `senarai` kosong (fix "kena ada
// juga" - staff/bendahari boleh nampak terus bulan mana yang memang
// tiada transaksi, bukan tertanya-tanya kenapa ia hilang dari laporan).
function HalamanBulan({ tahun, bulan, senarai, bakiAwalBulan, bakiAkhirBulan, noMula, akanBersambung }) {
  const masuk = senarai.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const keluar = senarai.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  return (
    <div className={`text-black p-10 ${akanBersambung ? 'print-page-break' : ''}`} style={{ width: '210mm', minHeight: '287mm' }}>
      <div className="text-center mb-5 border-b-2 border-black pb-3">
        <p className="text-base font-extrabold uppercase">{NAMA_BULAN[bulan - 1]} {tahun}</p>
        <p className="text-[10px] text-gray-600">Laporan Kewangan KKGS - Buku Besar Bulanan</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <KotakRingkas label="Baki Awal Bulan" nilai={bakiAwalBulan} />
        <KotakRingkas label="Masuk Bulan Ini" nilai={masuk} />
        <KotakRingkas label="Keluar Bulan Ini" nilai={keluar} />
        <KotakRingkas label="Baki Akhir Bulan" nilai={bakiAkhirBulan} />
      </div>

      <table className="w-full border-collapse border border-black text-[9px]">
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
          {senarai.length === 0 ? (
            <tr><td colSpan={8} className="border border-black p-2 text-center text-gray-500">Tiada transaksi bulan ini.</td></tr>
          ) : (
            senarai.map((t, i) => <BarisTransaksi key={t.id} t={t} no={noMula + i} />)
          )}
        </tbody>
        {senarai.length > 0 && (
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td colSpan={5} className="border border-black p-1 text-right">Jumlah {NAMA_BULAN[bulan - 1]} :</td>
              <td className="border border-black p-1 text-right">{masuk.toFixed(2)}</td>
              <td className="border border-black p-1 text-right">{keluar.toFixed(2)}</td>
              <td className="border border-black p-1 text-right">{bakiAkhirBulan.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {!akanBersambung && <FooterLaporan />}
    </div>
  )
}

// Laporan Kewangan KKGS - gaya Buku Besar (General Ledger) boleh cetak.
// SATU BULAN: satu halaman (ringkasan + jadual sekali). TAHUN PENUH:
// halaman "sampul" ringkasan + 12 HALAMAN BERASINGAN (satu bulan, satu
// halaman cetak - page-break antara setiap satu), Januari hingga Disember
// SENTIASA lengkap walaupun sesetengah bulan tiada transaksi.
// Tapisan tempoh dibuat SEBELUM hantar ke komponen ni; `transaksi` diterima
// dah tersusun MENAIK ikut tarikh dan sudah ada lajur `baki` siap kira.
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

  if (bulan) {
    return (
      <PrintArea>
        <HalamanRingkasan
          tajukPeriod={tajukPeriod} labelBakiAwal={`Baki Awal Tahun ${tahun}`}
          jumlahMasuk={jumlahMasuk} jumlahKeluar={jumlahKeluar} bakiBersihTempoh={bakiBersihTempoh}
          bakiAwalTempoh={bakiAwalTahun} bakiTerkumpul={bakiTerkumpul}
          pecahanMasuk={pecahanMasuk} pecahanKeluar={pecahanKeluar} akanBersambung
        />
        <HalamanBulan
          tahun={tahun} bulan={bulan} senarai={transaksi}
          bakiAwalBulan={bakiAwalTahun} bakiAkhirBulan={transaksi[transaksi.length - 1]?.baki ?? bakiAwalTahun}
          noMula={1} akanBersambung={false}
        />
      </PrintArea>
    )
  }

  const kumpulanBulan = kumpul12Bulan(transaksi, bakiAwalTahun)
  let noBerjalan = 1

  return (
    <PrintArea>
      <HalamanRingkasan
        tajukPeriod={tajukPeriod} labelBakiAwal={`Baki Awal Tahun ${tahun}`}
        jumlahMasuk={jumlahMasuk} jumlahKeluar={jumlahKeluar} bakiBersihTempoh={bakiBersihTempoh}
        bakiAwalTempoh={bakiAwalTahun} bakiTerkumpul={bakiTerkumpul}
        pecahanMasuk={pecahanMasuk} pecahanKeluar={pecahanKeluar} akanBersambung
      />
      {kumpulanBulan.map((k, i) => {
        const halaman = (
          <HalamanBulan
            key={k.bulan} tahun={tahun} bulan={k.bulan} senarai={k.senarai}
            bakiAwalBulan={k.bakiAwalBulan} bakiAkhirBulan={k.bakiAkhirBulan}
            noMula={noBerjalan} akanBersambung={i < kumpulanBulan.length - 1}
          />
        )
        noBerjalan += k.senarai.length
        return halaman
      })}
    </PrintArea>
  )
}
