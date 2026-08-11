import { useMemo, useState } from 'react'
import { X, Upload, AlertTriangle } from 'lucide-react'
import { baiFailMuridXlsx } from './xlsxImport.js'
import { gantiSemuaMurid } from '../../hooks/useMurid.js'

export default function ImportXlsxModal({ open, onClose, user, senaraiSediaAda, onSelesai }) {
  const [langkah, setLangkah] = useState('pilih') // pilih | pratonton | mengimport | selesai
  const [senaraiMurid, setSenaraiMurid] = useState([])
  const [lajurTakDikenali, setLajurTakDikenali] = useState([])
  const [ralat, setRalat] = useState(null)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [hasilAkhir, setHasilAkhir] = useState(null)

  const bandingan = useMemo(() => {
    const idSediaAda = new Set(senaraiSediaAda.map((m) => m.id))
    const idBaru = new Set(senaraiMurid.map((m) => m.idMurid))
    const bilanganBaru = senaraiMurid.filter((m) => !idSediaAda.has(m.idMurid)).length
    const bilanganKemaskini = senaraiMurid.filter((m) => idSediaAda.has(m.idMurid)).length
    const bilanganDipadam = senaraiSediaAda.filter((m) => !idBaru.has(m.id)).length
    return { bilanganBaru, bilanganKemaskini, bilanganDipadam }
  }, [senaraiMurid, senaraiSediaAda])

  if (!open) return null

  function tutup() {
    setLangkah('pilih')
    setSenaraiMurid([])
    setRalat(null)
    setHasilAkhir(null)
    onClose()
  }

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setRalat(null)
    try {
      const hasil = await baiFailMuridXlsx(fail)
      setSenaraiMurid(hasil.senaraiMurid)
      setLajurTakDikenali(hasil.lajurTakDikenali)
      setLangkah('pratonton')
    } catch (err) {
      setRalat(err.message || 'Gagal baca fail. Pastikan fail .xlsx yang betul.')
    }
    e.target.value = ''
  }

  async function sahkanImport() {
    setLangkah('mengimport')
    setRalat(null)
    try {
      const hasil = await gantiSemuaMurid(senaraiMurid, user.uid, (selesai, jumlah) => setProgres({ selesai, jumlah }))
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
          <h2 className="text-base font-bold text-ink">Ganti Data Murid (XLSX)</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        {langkah === 'pilih' && (
          <div className="text-center py-8">
            <p className="text-sm text-inkmuted mb-2">
              Muat naik fail Excel "Senarai Keseluruhan Murid" (eksport terus dari MOEIS - tak perlu ubah apa-apa dalam fail tu).
            </p>
            <p className="text-xs text-brand-red mb-5">
              Ini akan GANTI data sedia ada - murid yang tiada dalam fail baru akan dipadam.
            </p>
            <label className="inline-flex items-center gap-2 h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold cursor-pointer">
              <Upload size={18} /> Pilih Fail XLSX
              <input type="file" accept=".xlsx" onChange={pilihFail} className="hidden" />
            </label>
            {ralat && <p className="text-sm text-brand-red mt-4">{ralat}</p>}
          </div>
        )}

        {langkah === 'pratonton' && (
          <div>
            <p className="text-sm text-ink font-medium mb-1">
              {senaraiMurid.length} murid dijumpai dalam fail.
            </p>
            {lajurTakDikenali.length > 0 && (
              <p className="text-xs text-inkmuted mb-3">
                Lajur tak dikenali (diabaikan): {lajurTakDikenali.join(', ')}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 rounded-card bg-base text-center">
                <p className="text-lg font-bold text-ink">{bandingan.bilanganBaru}</p>
                <p className="text-xs text-inkmuted">Murid Baru</p>
              </div>
              <div className="p-3 rounded-card bg-base text-center">
                <p className="text-lg font-bold text-ink">{bandingan.bilanganKemaskini}</p>
                <p className="text-xs text-inkmuted">Dikemas Kini</p>
              </div>
              <div className="p-3 rounded-card bg-base text-center">
                <p className="text-lg font-bold text-brand-red">{bandingan.bilanganDipadam}</p>
                <p className="text-xs text-inkmuted">Akan Dipadam</p>
              </div>
            </div>

            {bandingan.bilanganDipadam > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-card bg-base border border-brand-red mb-4">
                <AlertTriangle size={16} className="text-brand-red shrink-0 mt-0.5" />
                <p className="text-xs text-ink">
                  <strong>{bandingan.bilanganDipadam} murid</strong> ada dalam sistem sekarang tapi TIADA dalam fail baru ni -
                  mereka akan <strong>dipadam</strong> selepas import. Pastikan fail ni memang senarai TERKINI/LENGKAP.
                </p>
              </div>
            )}

            <div className="border border-border rounded-card overflow-x-auto max-h-64 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">ID Murid</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Kelas</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Status RMT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {senaraiMurid.slice(0, 10).map((m) => (
                    <tr key={m.idMurid}>
                      <td className="px-3 py-2 text-inkmuted">{m.idMurid}</td>
                      <td className="px-3 py-2 text-ink">{m.nama}</td>
                      <td className="px-3 py-2 text-inkmuted">{m.namaKelas}</td>
                      <td className="px-3 py-2 text-inkmuted">{m.statusRMT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {senaraiMurid.length > 10 && (
                <p className="text-xs text-inkmuted text-center py-2">
                  ...dan {senaraiMurid.length - 10} lagi
                </p>
              )}
            </div>

            {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

            <div className="flex gap-3">
              <button
                onClick={sahkanImport}
                className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold"
              >
                Sahkan & Ganti Data
              </button>
              <button onClick={tutup} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
                Batal
              </button>
            </div>
          </div>
        )}

        {langkah === 'mengimport' && (
          <div className="text-center py-8">
            <p className="text-sm text-ink font-medium">
              Memproses… {progres.selesai} / {progres.jumlah}
            </p>
          </div>
        )}

        {langkah === 'selesai' && hasilAkhir && (
          <div className="text-center py-8">
            <p className="text-sm text-ink font-medium mb-1">Ganti data selesai.</p>
            <p className="text-xs text-inkmuted mb-5">
              {hasilAkhir.ditambahKemaskini} murid ditambah/dikemas kini, {hasilAkhir.dipadam} murid dipadam.
            </p>
            <button onClick={tutup} className="h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
