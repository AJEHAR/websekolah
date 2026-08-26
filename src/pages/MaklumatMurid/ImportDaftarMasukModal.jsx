import { useState } from 'react'
import { X, Upload, Download } from 'lucide-react'
import { baiFailDaftarMasukCsv } from './daftarMasukCsvImport.js'
import { importPukalDaftarMasuk } from '../../hooks/useDaftarMasukMurid.js'
import { muatTurunCSV } from '../../lib/csvUtils.js'

const HEADER_TEMPLAT = [
  'BILANGAN', 'TARIKH MASUK', 'NAMA', 'JANTINA', 'BANGSA', 'AGAMA', 'NO KAD PENGENALAN',
  'TARIKH DIPERANAKKAN', 'BILANGAN SURAT BERANAK', 'TEMPAT DIPERANAKKAN', 'DARJAH',
  'NO. KEBENARAN', 'NAMA PENJAGA', 'PERSAUDARAAN', 'PEKERJAAN', 'ALAMAT', 'SEKOLAH DAHULU',
]

const BARIS_CONTOH = [[
  '1', '05/01/2020', 'Ahmad bin Ali', 'L', 'Melayu', 'Islam', '120101010101',
  '01/01/2013', 'B12345', 'Kuantan', '1', 'K001', 'Puan Aminah binti Hassan',
  'Ibu', 'Suri Rumah', 'No 1, Jalan Contoh, 25200 Kuantan, Pahang', 'SK Contoh (kosongkan kalau bukan pindahan)',
]]

export default function ImportDaftarMasukModal({ open, onClose, user, senaraiMurid, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih')
  const [baris, setBaris] = useState([])
  const [lajurTakDikenali, setLajurTakDikenali] = useState([])
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  if (!open) return null

  const bilanganSepadan = baris.filter((b) => b.sepadan).length

  function muatTurunTemplat() {
    muatTurunCSV('templat-daftar-masuk-murid.csv', HEADER_TEMPLAT, BARIS_CONTOH)
  }

  function tutup() {
    setLangkah('pilih')
    setBaris([])
    setRalat(null)
    setHasilAkhir(null)
    onClose()
  }

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setRalat(null)
    try {
      const hasil = await baiFailDaftarMasukCsv(fail, senaraiMurid)
      setBaris(hasil.hasil)
      setLajurTakDikenali(hasil.lajurTakDikenali)
      setLangkah('pratonton')
    } catch (err) {
      setRalat(err.message || 'Gagal baca fail. Pastikan fail .csv yang betul.')
    }
    e.target.value = ''
  }

  async function sahkanImport() {
    setLangkah('mengimport')
    setRalat(null)
    try {
      const hasil = await importPukalDaftarMasuk(baris, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
      setHasilAkhir(hasil)
      setLangkah('selesai')
      onSelesai?.()
    } catch (err) {
      setRalat(err.message || 'Gagal import. Cuba lagi.')
      setLangkah('pratonton')
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Import Daftar Masuk (CSV) - Data Lama</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {langkah === 'pilih' && (
          <div className="text-center py-8">
            <p className="text-sm text-inkmuted mb-2">
              Muat naik fail CSV Buku Daftar Masuk Murid sedia ada (rekod lama).
            </p>
            <p className="text-xs text-inkmuted mb-5">
              Semua baris diimport terus sebagai rekod (SNAPSHOT sejarah kemasukan). Padanan dengan Murid semasa (ikut No.KP) cuma bonus rujukan - tak wajib, sesuai untuk murid yang dah tamat/keluar sekolah.
            </p>
            <button
              onClick={muatTurunTemplat}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-card border border-border text-ink text-sm font-semibold mb-3"
            >
              <Download size={16} /> Muat Turun Templat CSV
            </button>
            <br />
            <label className="inline-flex items-center gap-2 h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold cursor-pointer">
              <Upload size={18} /> Pilih Fail CSV
              <input type="file" accept=".csv" onChange={pilihFail} className="hidden" />
            </label>
            {ralat && <p className="text-sm text-brand-red mt-4">{ralat}</p>}
          </div>
        )}

        {langkah === 'pratonton' && (
          <div>
            <p className="text-sm text-ink font-medium mb-1">{baris.length} rekod dijumpai dalam fail.</p>
            {lajurTakDikenali.length > 0 && (
              <p className="text-xs text-inkmuted mb-3">Lajur tak dikenali (diabaikan): {lajurTakDikenali.join(', ')}</p>
            )}
            <p className="text-xs text-inkmuted mb-4">
              {bilanganSepadan} daripada {baris.length} rekod berjaya dikaitkan dengan Murid semasa (ikut No.KP) - selebihnya tetap diimport, cuma tiada pautan rujukan.
            </p>

            <div className="border border-border rounded-card overflow-x-auto max-h-64 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Bil.</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Darjah</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Sekolah Dahulu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {baris.slice(0, 10).map((b) => (
                    <tr key={b.barisKe}>
                      <td className="px-3 py-2 text-inkmuted">{b.data.bilangan || '-'}</td>
                      <td className="px-3 py-2 text-ink">{b.data.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.data.darjah || '-'}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.data.sekolahDahulu || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {baris.length > 10 && <p className="text-xs text-inkmuted text-center py-2">...dan {baris.length - 10} lagi</p>}
            </div>

            {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

            <div className="flex gap-3">
              <button onClick={sahkanImport} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold">
                Import {baris.length} Rekod
              </button>
              <button onClick={tutup} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
                Batal
              </button>
            </div>
          </div>
        )}

        {langkah === 'mengimport' && (
          <div className="text-center py-8">
            <p className="text-sm text-ink font-medium">Memproses… {progres.selesai} / {progres.jumlah}</p>
          </div>
        )}

        {langkah === 'selesai' && hasilAkhir && (
          <div className="text-center py-8">
            <p className="text-sm text-ink font-medium mb-1">Import selesai.</p>
            <p className="text-xs text-inkmuted mb-5">{hasilAkhir.bilangan} rekod ditambah.</p>
            <button onClick={tutup} className="h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
