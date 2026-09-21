import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { baiFailDelimaCsv } from './delimaCsvImport.js'
import { importPukalKurikulumDelima } from '../../hooks/useKurikulumDelima.js'

export default function ImportDelimaModal({ open, onClose, user, senaraiMurid, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih')
  const [baris, setBaris] = useState([])
  const [bilanganSepadan, setBilanganSepadan] = useState(0)
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  if (!open) return null

  function tutup() {
    setLangkah('pilih')
    setBaris([])
    setBilanganSepadan(0)
    setRalat(null)
    setHasilAkhir(null)
    onClose()
  }

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setRalat(null)
    try {
      const hasil = await baiFailDelimaCsv(fail, senaraiMurid)
      setBaris(hasil.hasil)
      setBilanganSepadan(hasil.bilanganSepadan)
      setLangkah('pratonton')
    } catch (err) {
      setRalat(err.message || 'Gagal baca fail. Pastikan fail .csv eksport DELIMa Pelajar yang betul.')
    }
    e.target.value = ''
  }

  async function sahkanImport() {
    const barisSepadan = baris.filter((b) => b.sepadan)
    setLangkah('mengimport')
    setRalat(null)
    try {
      const hasil = await importPukalKurikulumDelima(barisSepadan, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
      setHasilAkhir(hasil)
      setLangkah('selesai')
      onSelesai?.()
    } catch (err) {
      setRalat(err.message || 'Gagal import. Cuba lagi.')
      setLangkah('pratonton')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Muat Naik CSV DELIMa Pelajar</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {langkah === 'pilih' && (
          <div className="text-center py-8">
            <p className="text-sm text-inkmuted mb-2">
              Muat naik fail CSV eksport rasmi "DELIMa Pelajar Sekolah" (dimuat turun dari portal DELIMa).
            </p>
            <div className="text-xs bg-[#0F6E561A] border border-[#0F6E56]/30 rounded-card p-3 mb-5 text-left">
              <p className="text-inkmuted">Fail rasmi DELIMa cuma ada emel/ID Delima + maklumat murid - TIADA kata laluan. Import ni cuma isi/kemas kini <strong className="text-ink">emel</strong> setiap murid (dipadankan ikut MOEIS ID). Kata laluan sedia ada yang dah diisi manual TAK ditimpa - kekal seperti asal.</p>
            </div>
            <label className="inline-flex items-center gap-2 h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold cursor-pointer">
              <Upload size={18} /> Pilih Fail .csv
              <input type="file" accept=".csv" onChange={pilihFail} className="hidden" />
            </label>
            {ralat && <p className="text-sm text-brand-red mt-4">{ralat}</p>}
          </div>
        )}

        {langkah === 'pratonton' && (
          <div>
            <p className="text-sm text-ink font-medium mb-1">{baris.length} rekod dijumpai dalam fail.</p>
            <p className="text-xs text-inkmuted mb-4">
              <strong className="text-ink">{bilanganSepadan}</strong> daripada {baris.length} rekod berjaya dikaitkan dengan Murid semasa (ikut MOEIS ID) - hanya rekod yang sepadan akan diimport. Selebihnya diabaikan (mungkin murid dah tamat/keluar, atau MOEIS ID tak sepadan rekod Murid).
            </p>

            <div className="border border-border rounded-card overflow-x-auto max-h-64 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Kelas</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Emel Delima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {baris.slice(0, 30).map((b) => (
                    <tr key={b.barisKe}>
                      <td className="px-3 py-2">
                        {b.sepadan
                          ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Sepadan</span>
                          : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-base text-inkmuted">Tiada padanan</span>}
                      </td>
                      <td className="px-3 py-2 text-ink">{b.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{b.kelas || '-'}</td>
                      <td className="px-3 py-2 text-inkmuted truncate max-w-[180px]">{b.emel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {baris.length > 30 && <p className="text-xs text-inkmuted text-center py-2">...dan {baris.length - 30} lagi</p>}
            </div>

            {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

            <div className="flex gap-3">
              <button onClick={sahkanImport} disabled={bilanganSepadan === 0} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-50">
                Import {bilanganSepadan} Rekod Sepadan
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
            <p className="text-xs text-inkmuted mb-5">{hasilAkhir.bilangan} rekod emel dikemas kini.</p>
            <button onClick={tutup} className="h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
