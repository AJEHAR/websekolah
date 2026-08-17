import { useState } from 'react'
import { X, Upload, Download } from 'lucide-react'
import { baiFailSijilTamatCsv } from './sijilTamatCsvImport.js'
import { importPukalSijilTamat } from '../../hooks/useSijilTamat.js'
import { muatTurunCSV } from '../../lib/csvUtils.js'

const HEADER_TEMPLAT = [
  'BIL', 'NO KP', 'NAMA', 'KELAS', 'DARJAH', 'TAHUN TAMAT', 'NO PENDAFTARAN',
  'TARIKH KELUAR SEKOLAH', 'TARIKH MASUK SEKOLAH', 'TARIKH LAHIR', 'NO SURAT BERANAK',
  'KELAKUAN', 'SEBAB BERHENTI', 'NAMA IBU BAPA PENJAGA', 'JUMLAH KEHADIRAN',
  'UNIT BERUNIFORM', 'KELAB', 'SUKAN',
]

const BARIS_CONTOH = [[
  '1', '120101010101', 'Ahmad bin Ali', '6 Kuantan', '6', '2025', '45',
  '15/11/2025', '02/01/2019', '01/01/2013', 'B12345',
  'Sangat Baik', 'Tamat persekolahan', 'Puan Aminah binti Hassan', '195 hari',
  'Pengakap', 'Kelab Sains', 'Bola Sepak',
]]

export default function ImportSijilTamatModal({ open, onClose, user, senaraiMurid, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih')
  const [baris, setBaris] = useState([])
  const [lajurTakDikenali, setLajurTakDikenali] = useState([])
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  if (!open) return null

  const bilanganSepadan = baris.filter((b) => b.data.muridId).length

  function muatTurunTemplat() {
    muatTurunCSV('templat-sijil-tamat.csv', HEADER_TEMPLAT, BARIS_CONTOH)
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
      const hasil = await baiFailSijilTamatCsv(fail, senaraiMurid)
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
      const hasil = await importPukalSijilTamat(baris, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
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
          <h2 className="text-base font-bold text-ink">Import Sijil Tamat (CSV) - Data Lama</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {langkah === 'pilih' && (
          <div className="text-center py-8">
            <p className="text-sm text-inkmuted mb-2">Muat naik fail CSV data Sijil Tamat sedia ada (rekod lama).</p>
            <p className="text-xs text-inkmuted mb-5">
              Semua 18 lajur diimport terus sebagai rekod sijil - padanan dengan Murid sedia ada (ikut No.KP) cuma bonus rujukan, bukan wajib.
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
              {bilanganSepadan} daripada {baris.length} rekod berjaya dikaitkan dengan Murid sedia ada (ikut No.KP).
            </p>

            <div className="border border-border rounded-card overflow-x-auto max-h-64 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Bil.</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Tahun Tamat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {baris.slice(0, 10).map((b) => (
                    <tr key={b.barisKe}>
                      <td className="px-3 py-2 text-inkmuted">{b.data.bilangan || '-'}</td>
                      <td className="px-3 py-2 text-ink">{b.data.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.data.tahunTamat || '-'}</td>
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
