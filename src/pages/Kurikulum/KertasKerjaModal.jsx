import { useState } from 'react'
import { X } from 'lucide-react'

const TAHUN_SEKARANG = new Date().getFullYear()

export default function KertasKerjaModal({ open, rekod, onClose, onSimpan }) {
  const [tajuk, setTajuk] = useState(rekod?.tajuk ?? '')
  const [anjuran, setAnjuran] = useState(rekod?.anjuran ?? '')
  const [tahun, setTahun] = useState(rekod?.tahun ?? String(TAHUN_SEKARANG))
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!tajuk.trim()) return setRalat('Sila isi Tajuk.')
    if (!anjuran.trim()) return setRalat('Sila isi Anjuran.')
    if (!tahun.trim()) return setRalat('Sila isi Tahun.')

    setMenyimpan(true)
    try {
      await onSimpan({ tajuk: tajuk.trim(), anjuran: anjuran.trim(), tahun: tahun.trim() })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{rekod ? 'Edit Kertas Kerja' : 'Kertas Kerja Baharu'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="tajuk" className="block text-sm font-medium text-ink mb-1">Tajuk <span className="text-brand-red">*</span></label>
            <textarea
              id="tajuk"
              rows={2}
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="cth. Program Jelajah Kemahiran Hidup 2026"
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="anjuran" className="block text-sm font-medium text-ink mb-1">Anjuran <span className="text-brand-red">*</span></label>
            <input
              id="anjuran"
              type="text"
              value={anjuran}
              onChange={(e) => setAnjuran(e.target.value)}
              placeholder="cth. Unit Kokurikulum, SK Pendidikan Khas Kuantan"
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="tahunKK" className="block text-sm font-medium text-ink mb-1">Tahun <span className="text-brand-red">*</span></label>
            <input
              id="tahunKK"
              type="text"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm max-w-[140px]"
            />
            <p className="text-[11px] text-inkmuted mt-1">Guna gambar muka depan tahun yang sepadan (uruskan di tab Muka Depan).</p>
          </div>

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {menyimpan ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button type="button" onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
