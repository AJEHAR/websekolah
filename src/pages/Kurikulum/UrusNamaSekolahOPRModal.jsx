import { useState } from 'react'
import { X } from 'lucide-react'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { simpanOprNamaSekolah } from '../../hooks/useOprNamaSekolah.js'

// Urus header cetakan OPR (nama sekolah + 2 baris sub-tajuk) - BOLEH
// TAIP MANUAL, khusus OPR sahaja (TAK sentuh NAMA_SEKOLAH tetap yang
// dikongsi RPT/RPI/Kertas Kerja). Dipapar SAMA di Gaya 1 & Gaya 2 (staff
// minta konsisten). Kosongkan mana-mana untuk kembali guna teks lalai.
export default function UrusNamaSekolahOPRModal({ open, namaSekolah, subHeader1, subHeader2, seksyen, user, onClose, onSelesai }) {
  const [nama, setNama] = useState(namaSekolah ?? '')
  const [sub1, setSub1] = useState(subHeader1 ?? '')
  const [sub2, setSub2] = useState(subHeader2 ?? '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    setRalat(null)
    try {
      await simpanOprNamaSekolah(seksyen, { namaSekolah: nama, subHeader1: sub1, subHeader2: sub2 }, user.uid)
      onSelesai()
      onClose()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Header Cetakan OPR</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-4">Taip teks nak dipaparkan di kepala setiap cetakan OPR bahagian ni (Gaya 1 & Gaya 2, sama). Kosongkan untuk guna teks lalai sistem.</p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Nama Sekolah</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={NAMA_SEKOLAH}
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Sub-tajuk 1</label>
            <input
              type="text"
              value={sub1}
              onChange={(e) => setSub1(e.target.value)}
              placeholder="cth. Program {Unit}"
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Sub-tajuk 2</label>
            <input
              type="text"
              value={sub2}
              onChange={(e) => setSub2(e.target.value)}
              placeholder="cth. One Page Report (OPR) {Unit}"
              className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm"
            />
          </div>
          <p className="text-[10px] text-inkmuted">Taip <code>{'{Unit}'}</code> dalam sub-tajuk untuk auto-gantikan dengan nama Unit laporan tu.</p>
        </div>

        {ralat && <p className="text-xs text-brand-red mb-3">{ralat}</p>}

        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
