import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_BULAN } from './kkgsConstants.js'

function tarikhHariIni() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Kumpul transaksi (tersusun MENAIK ikut tarikh, dgn lajur `baki` dah
// dikira sebelum sampai sini) ikut SEMUA 12 BULAN (Januari-Disember) -
// SENTIASA 12 kumpulan walaupun sesetengah bulan tiada transaksi langsung.
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

// Bilangan baris jadual dibenarkan setiap muka surat cetak, supaya SATU
// bulan yang panjang (banyak transaksi) dipecah kepada beberapa muka surat
// KAMI SENDIRI kawal (bukan biar pelayar "overflow" automatik) - elak bug
// "potongan next page tiada jarak A4" (muka surat sambungan hilang padding
// sebab pelayar cuma letak padding pada MUKA PERTAMA satu div panjang,
// bukan pada setiap muka surat yang overflow secara semula jadi).
//
// Nombor ni dikira dari anggaran ketinggian sebenar setiap bahagian pada
// muka A4 (297mm, tolak padding p-10 ~21mm = ~276mm ruang boleh guna):
//   Tajuk + garis  ~26mm | Kotak ringkasan (muka pertama sahaja) ~26mm
//   Header jadual  ~7mm  | Setiap baris jadual (font 9px + padding) ~5mm
// Muka pertama : (276 - 26 - 26 - 7) / 5 ~= 43 baris -> guna 32 (buffer
// selamat, sebab telefon/PC kadang cetak guna saiz kertas "Letter" yg
// LEBIH PENDEK drpd A4 - lihat nota `minHeight` di bawah).
// Muka sambungan: (276 - 20 - 7) / 5 ~= 50 baris -> guna 42.
const MAKS_BARIS_MUKA_MULA = 32 // muka pertama bulan - ada ruang kotak ringkasan
const MAKS_BARIS_MUKA_SAMBUNG = 42 // muka sambungan - jadual sahaja, lebih ruang

function pecahBarisMukaSurat(senarai) {
  if (senarai.length === 0) return [[]]
  const kepingan = []
  let i = 0
  let saiz = MAKS_BARIS_MUKA_MULA
  while (i < senarai.length) {
    kepingan.push(senarai.slice(i, i + saiz))
    i += saiz
    saiz = MAKS_BARIS_MUKA_SAMBUNG
  }
  return kepingan
}

// PENTING (fix "kotak 4 di atas kosong bila cetak"): guna FLEXBOX, BUKAN
// CSS Grid, utk barisan kotak statistik kecil ni. Chrome ada bug lama -
// bila `display:grid` dipakai dgn beberapa <p> bertindih dalam satu sel
// grid + `page-break`/`@page` custom, baris KEDUA (nilai RM) kadang tak
// tercetak langsung walaupun nampak sempurna di skrin biasa. Flexbox tak
// ada masalah ni.
function BarisanKotakRingkas({ kotak }) {
  return (
    <div className="flex gap-3 mb-4">
      {kotak.map(({ label, nilai }) => (
        <div key={label} className="flex-1 border border-black p-3 text-center">
          <p className="text-[10px] text-gray-600">{label}</p>
          <p className="text-base font-bold" style={{ color: '#000' }}>RM {nilai.toFixed(2)}</p>
        </div>
      ))}
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

// Ruang tandatangan Pengerusi & Bendahari KKGS - setiap satu ada 2 garisan
// (satu utk NAMA ditulis tangan, satu utk tandatangan sebenar), letak
// bersebelahan supaya kedua-dua pihak sahkan penyata bulanan yang sama.
function KotakTandatangan({ jawatan }) {
  return (
    <div className="text-center">
      <div className="w-40 border-b border-black mb-1" style={{ height: '36px' }} />
      <p className="text-[10px] text-gray-600">(Nama: ……………………………………)</p>
      <p className="text-xs font-semibold mt-1">{jawatan}</p>
    </div>
  )
}

function FooterLaporan() {
  return (
    <div className="mt-8">
      <div className="flex justify-around gap-6 mb-4">
        <KotakTandatangan jawatan="Bendahari KKGS" />
        <KotakTandatangan jawatan="Pengerusi KKGS" />
      </div>
      <p className="text-xs text-gray-600 text-right">Laporan dijana sistem pada {tarikhHariIni()}</p>
    </div>
  )
}

// Halaman 1 - "sampul" ringkasan keseluruhan tempoh (jumlah besar +
// pecahan kategori). `akanBersambung` = ada halaman lepas ni.
function HalamanRingkasan({ tajukPeriod, labelBakiAwal, jumlahMasuk, jumlahKeluar, bakiBersihTempoh, bakiAwalTempoh, bakiTerkumpul, pecahanMasuk, pecahanKeluar, akanBersambung }) {
  const kotak = []
  if (bakiAwalTempoh != null) kotak.push({ label: labelBakiAwal, nilai: bakiAwalTempoh })
  kotak.push({ label: 'Jumlah Masuk', nilai: jumlahMasuk })
  kotak.push({ label: 'Jumlah Keluar', nilai: jumlahKeluar })
  kotak.push({ label: 'Baki Bersih Tempoh Ini', nilai: bakiBersihTempoh })

  return (
    // PENTING (fix "muka kosong/separuh bila cetak"): TIADA minHeight
    // dipaksa di sini. Sebelum ni minHeight:287mm anggap kertas MESTI A4
    // (297mm) - tapi telefon/pelayar sering default ke saiz "Letter"
    // (279mm, LEBIH PENDEK drpd A4). Bila kandungan dipaksa 287mm tinggi
    // atas kertas 279mm, baki ~8mm tu "melimpah" jadi muka tambahan yang
    // hampir kosong. Biar div ni tinggi ikut kandungan SEBENAR sahaja -
    // `print-page-break` (page-break-after) tetap pastikan muka SETERUSNYA
    // mula bersih, tak kira saiz kertas A4 atau Letter.
    <div className={`text-black p-10 ${akanBersambung ? 'print-page-break' : ''}`} style={{ width: '210mm' }}>
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <p className="text-lg font-extrabold uppercase">Laporan Kewangan KKGS</p>
        <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
        <p className="text-xs font-semibold mt-1">Bagi Tempoh: {tajukPeriod}</p>
      </div>

      <BarisanKotakRingkas kotak={kotak} />

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

// SATU muka surat bagi SATU keping (chunk) baris jadual bulan tertentu.
// `keping === 0` (muka PERTAMA bulan ni) papar tajuk penuh + kotak
// ringkasan bulan; keping seterusnya (sambungan, sebab jadual terlalu
// panjang utk 1 muka) papar tajuk ringkas "(Sambungan)" sahaja - tapi
// KEKAL dapat padding p-10 sendiri (fix "tiada jarak A4 profesional" -
// dulu overflow jadual biar pelayar sambung sendiri ke muka baru TANPA
// padding, sekarang KITA yang pecah & bagi setiap muka padding sendiri).
function HalamanBulan({ tahun, bulan, baris, noMula, keping, jumlahKeping, bakiAwalBulan, bakiAkhirBulan, masuk, keluar, akanBersambung }) {
  const mukaPertama = keping === 0
  const mukaTerakhirBulan = keping === jumlahKeping - 1

  return (
    <div className={`text-black p-10 ${akanBersambung ? 'print-page-break' : ''}`} style={{ width: '210mm' }}>
      <div className="text-center mb-5 border-b-2 border-black pb-3">
        <p className="text-lg font-extrabold uppercase">Laporan Kewangan KKGS</p>
        <p className="text-xs">Kelab Kebajikan Guru &amp; Staf</p>
        <p className="text-xs font-semibold mt-1">
          Bagi Bulan: {NAMA_BULAN[bulan - 1]} {tahun}{!mukaPertama && ` (Sambungan, muka ${keping + 1})`}
        </p>
      </div>

      {mukaPertama && (
        <BarisanKotakRingkas kotak={[
          { label: 'Baki Awal Bulan', nilai: bakiAwalBulan },
          { label: 'Masuk Bulan Ini', nilai: masuk },
          { label: 'Keluar Bulan Ini', nilai: keluar },
          { label: 'Baki Akhir Bulan', nilai: bakiAkhirBulan },
        ]} />
      )}

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
          {baris.length === 0 ? (
            <tr><td colSpan={8} className="border border-black p-2 text-center text-gray-500">Tiada transaksi bulan ini.</td></tr>
          ) : (
            baris.map((t, i) => <BarisTransaksi key={t.id} t={t} no={noMula + i} />)
          )}
        </tbody>
        {mukaTerakhirBulan && baris.length > 0 && (
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
      {!mukaTerakhirBulan && (
        <p className="text-[10px] text-gray-500 mt-2 italic">… bersambung ke muka surat seterusnya.</p>
      )}

      {!akanBersambung && <FooterLaporan />}
    </div>
  )
}

// Laporan Kewangan KKGS - gaya Buku Besar (General Ledger) boleh cetak.
// SATU BULAN: 1 (atau lebih, jika jadual panjang) muka surat bulan tu
// sahaja. TAHUN PENUH: halaman "sampul" ringkasan + muka surat Januari
// hingga Disember (setiap bulan mula pada muka BAHARU - `print-page-break`
// - dan bulan panjang dipecah sendiri kepada beberapa muka, BUKAN dibiar
// overflow pelayar). Tapisan tempoh dibuat SEBELUM hantar ke komponen ni;
// `transaksi` diterima dah tersusun MENAIK ikut tarikh dgn lajur `baki`
// siap kira.
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

  // Senarai bulan yg perlu dipaparkan sbg muka surat "Buku Besar" -
  // SATU bulan sahaja (mod bulan tertentu) atau semua 12 (Tahun Penuh).
  const kumpulanBulan = bulan
    ? [{ bulan, senarai: transaksi, bakiAwalBulan: bakiAwalTahun, bakiAkhirBulan: transaksi[transaksi.length - 1]?.baki ?? bakiAwalTahun }]
    : kumpul12Bulan(transaksi, bakiAwalTahun)

  // Pecah setiap bulan kepada beberapa "keping" (muka surat) ikut had
  // baris setiap muka, sambil kekalkan No siri bersambung sepanjang
  // laporan dan jumlah masuk/keluar/baki SEBENAR bulan (dikira dari
  // SENARAI PENUH bulan tu, bukan sekadar keping semasa).
  const semuaMuka = []
  let noBerjalan = 1
  kumpulanBulan.forEach((k) => {
    const kepingan = pecahBarisMukaSurat(k.senarai)
    const masuk = k.senarai.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
    const keluar = k.senarai.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
    kepingan.forEach((baris, idx) => {
      semuaMuka.push({
        tahun, bulan: k.bulan, baris, noMula: noBerjalan, keping: idx, jumlahKeping: kepingan.length,
        bakiAwalBulan: k.bakiAwalBulan, bakiAkhirBulan: k.bakiAkhirBulan, masuk, keluar,
      })
      noBerjalan += baris.length
    })
  })

  return (
    <PrintArea>
      <HalamanRingkasan
        tajukPeriod={tajukPeriod} labelBakiAwal={`Baki Awal Tahun ${tahun}`}
        jumlahMasuk={jumlahMasuk} jumlahKeluar={jumlahKeluar} bakiBersihTempoh={bakiBersihTempoh}
        bakiAwalTempoh={bakiAwalTahun} bakiTerkumpul={bakiTerkumpul}
        pecahanMasuk={pecahanMasuk} pecahanKeluar={pecahanKeluar} akanBersambung={semuaMuka.length > 0}
      />
      {semuaMuka.map((h, i) => (
        <HalamanBulan key={`${h.bulan}_${h.keping}`} {...h} akanBersambung={i < semuaMuka.length - 1} />
      ))}
    </PrintArea>
  )
}
