import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { simpanKehadiranKelas } from '../../hooks/useKehadiranMurid.js'
import { adalahPra } from '../MaklumatMurid/statistikMurid.js'

export default function KehadiranMuridModal({ kelas, rekod, tarikh, user, onClose, onSelesai }) {
  const [kehadiran, setKehadiran] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    if (!kelas) return
    if (rekod) {
      const peta = {}
      rekod.senaraiMurid.forEach((m) => { peta[m.idMurid] = m.hadir })
      setKehadiran(peta)
    } else {
      const peta = {}
      kelas.ahli.forEach((m) => { peta[m.idMurid] = true }) // default semua hadir
      setKehadiran(peta)
    }
  }, [kelas, rekod])

  if (!kelas) return null

  function toggl(idMurid) {
    setKehadiran((k) => ({ ...k, [idMurid]: !k[idMurid] }))
  }

  const jumlahHadir = kelas.ahli.filter((m) => kehadiran[m.idMurid]).length

  async function hantar() {
    setMenyimpan(true)
    try {
      const senaraiMurid = kelas.ahli.map((m) => ({
        idMurid: m.idMurid,
        nama: m.nama,
        jantina: m.jantina,
        hadir: Boolean(kehadiran[m.idMurid]),
        // Snapshot status RMT PADA MASA INI - PRA tak dikira RMT langsung.
        adalahRMT: !adalahPra(m) && m.statusRMT === 'YA',
      }))
      await simpanKehadiranKelas(tarikh, kelas.namaKelas, senaraiMurid, user.uid)
      onSelesai()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-ink">{kelas.namaKelas}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-4">
          {jumlahHadir} / {kelas.ahli.length} hadir — tekan nama untuk tanda tak hadir
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {kelas.ahli.map((m) => {
            const hadir = kehadiran[m.idMurid] ?? true
            return (
              <button
                key={m.idMurid}
                onClick={() => toggl(m.idMurid)}
                className="flex items-center gap-2 p-2.5 rounded-card text-left text-xs font-medium transition-colors"
                style={{ backgroundColor: hadir ? '#EAF3DE' : '#F1EFE8', color: hadir ? '#27500A' : '#888780' }}
              >
                {hadir && <Check size={14} className="shrink-0" />}
                <span className="truncate">{m.nama}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={hantar}
          disabled={menyimpan}
          className="w-full h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Submit Kehadiran'}
        </button>
      </div>
    </div>
  )
}
