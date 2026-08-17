import { useState } from 'react'
import { X, Upload, Download, AlertTriangle } from 'lucide-react'
import { baiFailDaftarMasukCsv } from './daftarMasukCsvImport.js'
import { importPukalDaftarMasuk } from '../../hooks/useDaftarMasukMurid.js'
import { muatTurunCSV } from '../../lib/csvUtils.js'

const HEADER_TEMPLAT = [
  'BILANGAN', 'ID MURID', 'NO KAD PENGENALAN', 'NAMA',
  'BILANGAN SURAT BERANAK', 'TEMPAT DIPERANAKKAN', 'NO KEBENARAN', 'SEKOLAH DAHULU',
]

export default function ImportDaftarMasukModal({ open, onClose, user, senaraiMurid, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih') // pilih | pratonton | mengimport | selesai
  const [baris, setBaris] = useState([])
  const [lajurTakDikenali, setLajurTakDikenali] = useState([])
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  if (!open) return null

  const sepadan = baris.filter((b) => b.sepadan)
  const takSepadan = baris.filter((b) => !b.sepadan)

  function muatTurunTemplat() {
    // Baris contoh guna murid SEBENAR pertama dalam senarai (kalau ada) -
    // tunjuk macam mana ID MURID/Nama sebenar nampak, senang staff faham
    // bukan sekadar teks placeholder kosong.
    const contoh = senaraiMurid[0]
    const barisContoh = contoh
      ? [['1', contoh.id, contoh.noPengenalan || '', contoh.nama || '', 'B12345', 'Kuantan', 'K001', 'SK Contoh (kosongkan kalau bukan pindahan)']]
      : [['1', 'M00123', '120101010101', 'Ahmad bin Ali', 'B12345', 'Kuantan', 'K001', 'SK Contoh (kosongkan kalau bukan pindahan)']]
    muatTurunCSV('templat-daftar-masuk-murid.csv', HEADER_TEMPLAT, barisContoh)
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
      const hasil = await importPukalDaftarMasuk(sepadan, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
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
              Muat naik fail CSV data Daftar Masuk Murid yang sedia ada (rekod lama).
            </p>
            <p className="text-xs text-inkmuted mb-1">
              Lajur dikenali: BILANGAN, ID MURID (atau NO KAD PENGENALAN), BILANGAN SURAT BERANAK, TEMPAT DIPERANAKKAN, NO KEBENARAN, SEKOLAH DAHULU.
            </p>
            <p className="text-xs text-brand-red mb-5">
              Setiap baris kena sepadan dengan rekod Murid sedia ada (ikut ID MURID/No.KP) - baris tak sepadan akan diabaikan.
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
            <p className="text-sm text-ink font-medium mb-1">{baris.length} baris dijumpai dalam fail.</p>
            {lajurTakDikenali.length > 0 && (
              <p className="text-xs text-inkmuted mb-3">Lajur tak dikenali (diabaikan): {lajurTakDikenali.join(', ')}</p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-card bg-base text-center">
                <p className="text-lg font-bold text-ink">{sepadan.length}</p>
                <p className="text-xs text-inkmuted">Sepadan (akan diimport)</p>
              </div>
              <div className="p-3 rounded-card bg-base text-center">
                <p className="text-lg font-bold text-brand-red">{takSepadan.length}</p>
                <p className="text-xs text-inkmuted">Tiada Padanan (diabaikan)</p>
              </div>
            </div>

            {takSepadan.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-card bg-base border border-brand-red mb-4">
                <AlertTriangle size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div className="text-xs text-ink">
                  <p className="mb-1"><strong>{takSepadan.length} baris</strong> tak jumpa murid sepadan (ID MURID/No.KP tak wujud dalam data Murid) - TAK akan diimport:</p>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                    {takSepadan.slice(0, 8).map((b) => (
                      <li key={b.barisKe}>Baris {b.barisKe}: {b.mentah.namaRujukan || b.mentah.idMurid || b.mentah.noPengenalan || '(tiada rujukan)'}</li>
                    ))}
                  </ul>
                  {takSepadan.length > 8 && <p className="mt-1">...dan {takSepadan.length - 8} lagi</p>}
                </div>
              </div>
            )}

            <div className="border border-border rounded-card overflow-x-auto max-h-64 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Bil.</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama (Murid Sepadan)</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Sekolah Dahulu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sepadan.slice(0, 10).map((b) => (
                    <tr key={b.barisKe}>
                      <td className="px-3 py-2 text-inkmuted">{b.mentah.bilangan || '-'}</td>
                      <td className="px-3 py-2 text-ink">{b.murid.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.mentah.sekolahDahulu || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sepadan.length > 10 && <p className="text-xs text-inkmuted text-center py-2">...dan {sepadan.length - 10} lagi</p>}
            </div>

            {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

            <div className="flex gap-3">
              <button
                onClick={sahkanImport}
                disabled={sepadan.length === 0}
                className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-40"
              >
                Import {sepadan.length} Rekod
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
