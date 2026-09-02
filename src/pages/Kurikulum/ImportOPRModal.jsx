import { useState } from 'react'
import { X, Upload, Download } from 'lucide-react'
import { baiFailOprCsv } from './oprCsvImport.js'
import { importPukalLaporanOPR } from '../../hooks/useLaporanOPR.js'
import { muatTurunCSV } from '../../lib/csvUtils.js'

// Header + 1 baris contoh untuk templat CSV boleh muat turun - susunan
// SEBIJIK sama dengan yang dibaca dalam oprCsvImport.js (ikut KEDUDUKAN
// lajur, bukan tajuk - lihat nota di fail tu). Lajur "lama" yang tak
// relevan untuk laporan baru (Timestamp, ID lama, link Google Drive)
// dikekalkan supaya kedudukan lajur tak tergeser walaupun kosongkan.
const HEADER_TEMPLAT = [
  'Timestamp', 'ID (lama - boleh kosong)', 'Unit', 'Nama Program/Aktiviti', 'Hari', 'Tarikh', 'Tempat',
  'Sasaran', 'Objektif', 'Aktiviti', 'Kekuatan', 'Kelemahan', 'Penambahbaikan',
  'Nama Disediakan', 'Jawatan Disediakan', 'Pautan Tandatangan Disediakan (Google Drive, jika ada)',
  'Nama Disahkan', 'Jawatan Disahkan', 'Pautan Tandatangan Disahkan (Google Drive, jika ada)',
  'Gambar (JSON array pautan Drive, cth ["url1","url2"] - boleh kosong)',
  'Latar Belakang (pautan Drive, boleh kosong)', 'Masa',
]

const BARIS_CONTOH = [[
  '', '', 'Unit Beruniform', 'Perkhemahan Tahunan', 'Sabtu', '14/03/2026', 'Padang Sekolah',
  '40 orang murid Tingkatan 1-3', 'Memupuk semangat kerjasama dan kepimpinan',
  'Aktiviti ketahanan, gotong-royong, permainan berpasukan',
  'Penyertaan aktif murid', 'Cuaca panas menjelang tengahari', 'Sediakan khemah rehat tambahan',
  'Cikgu Ahmad bin Ali', 'Guru Penasihat', '',
  'Cikgu Salmah binti Hassan', 'Guru Besar', '',
  '[]', '', '8:00 pagi - 5:00 petang',
]]

export default function ImportOPRModal({ open, seksyen, onClose, user, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih')
  const [baris, setBaris] = useState([])
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  if (!open) return null

  function muatTurunTemplat() {
    muatTurunCSV('templat-import-opr.csv', HEADER_TEMPLAT, BARIS_CONTOH)
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
      const hasil = await baiFailOprCsv(fail)
      setBaris(hasil)
      setLangkah('pratonton')
    } catch (err) {
      setRalat(err.message || 'Gagal baca fail. Pastikan fail .csv eksport terus dari Google Sheet.')
    }
    e.target.value = ''
  }

  async function sahkanImport() {
    setLangkah('mengimport')
    setRalat(null)
    try {
      const hasil = await importPukalLaporanOPR(seksyen, baris, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
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
          <h2 className="text-base font-bold text-ink">Import OPR (Data Lama - Google Sheets)</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {langkah === 'pilih' && (
          <div className="text-center py-8">
            <p className="text-sm text-inkmuted mb-2">
              Muat naik fail CSV data lama (eksport terus dari Google Sheet), atau isi templat baru untuk laporan OPR yang belum ada dalam sistem.
            </p>
            <p className="text-xs text-brand-red mb-5">
              PENTING: Jangan susun semula lajur - sistem baca ikut kedudukan lajur asal (Timestamp, ID, Unit, Nama, Hari...).
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
            <p className="text-sm text-ink font-medium mb-4">{baris.length} rekod dijumpai dalam fail.</p>

            <div className="border border-border rounded-card overflow-x-auto max-h-72 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Unit</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama Program</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Tarikh</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Gambar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {baris.slice(0, 15).map((b) => (
                    <tr key={b.barisKe}>
                      <td className="px-3 py-2 text-inkmuted">{b.data.unit || '-'}</td>
                      <td className="px-3 py-2 text-ink">{b.data.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.data.tarikh || '-'}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.data.gambar.filter(Boolean).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {baris.length > 15 && <p className="text-xs text-inkmuted text-center py-2">...dan {baris.length - 15} lagi</p>}
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
            <p className="text-xs text-inkmuted mb-5">{hasilAkhir.bilangan} laporan OPR ditambah. Gambar/tandatangan kekal guna pautan Google Drive asal.</p>
            <button onClick={tutup} className="h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
