import { useState } from 'react'
import { X } from 'lucide-react'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { simpanOprNamaSekolah } from '../../hooks/useOprNamaSekolah.js'

// Urus nama sekolah dipaparkan di kepala cetakan OPR - BOLEH TAIP MANUAL,
// khusus untuk OPR sahaja (TAK sentuh NAMA_SEKOLAH tetap yang dikongsi
// RPT/RPI/Kertas Kerja - itu kekal seperti sedia ada, ikut keputusan
// pengguna). Kosongkan untuk kembali guna nama sekolah lalai sistem.
export default function UrusNamaSekolahOPRModal({ open, namaSekolah, seksyen, user, onClose, onSelesai }) {
  const [nilai, setNilai] = useState(namaSekolah ?? '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    setRalat(null)
    try {
      await simpanOprNamaSekolah(seksyen, nilai, user.uid)
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
          <h3 className="text-sm font-bold text-ink">Nama Sekolah (Cetakan OPR)</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-4">Taip nama yang nak dipaparkan di kepala setiap cetakan OPR bahagian ni sahaja. Kosongkan untuk guna nama sekolah lalai ("{NAMA_SEKOLAH}").</p>

        <input
          type="text"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          placeholder={NAMA_SEKOLAH}
          className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm mb-4"
        />

        {ralat && <p className="text-xs text-brand-red mb-3">{ralat}</p>}

        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
