import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useLaporanHarian, padamLaporanHarian } from '../../hooks/useLaporanHarian.js'
import LaporanHarianForm from './LaporanHarianForm.jsx'
import LaporanHarianDetailModal from './LaporanHarianDetailModal.jsx'

export default function LaporanHarian() {
  const { user } = useOutletContext()
  const { senarai, loading, muatSemula } = useLaporanHarian()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [laporanEdit, setLaporanEdit] = useState(null)
  const [laporanLihat, setLaporanLihat] = useState(null)

  function bukaTambah() {
    setLaporanEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(laporan) {
    setLaporanEdit(laporan)
    setTunjukBorang(true)
  }

  function selesai() {
    setTunjukBorang(false)
    setLaporanEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!window.confirm('Padam laporan harian ini?')) return
    await padamLaporanHarian(id)
    muatSemula()
  }

  if (tunjukBorang) {
    return (
      <LaporanHarianForm
        key={laporanEdit?.id ?? 'baru'}
        laporan={laporanEdit}
        user={user}
        onSelesai={selesai}
        onBatal={() => { setTunjukBorang(false); setLaporanEdit(null) }}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-inkmuted">{senarai.length} laporan</p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
        >
          <Plus size={14} /> Laporan Baru
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada laporan harian lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Minggu {l.minggu}</p>
                <p className="text-xs text-inkmuted">{l.hari}, {l.tarikh} · {l.peratusKehadiranMurid}% kehadiran murid</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setLaporanLihat(l)} aria-label="Lihat" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Eye size={16} />
                </button>
                <button onClick={() => bukaEdit(l)} aria-label="Edit" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={16} />
                </button>
                <button onClick={() => padam(l.id)} aria-label="Padam" className="p-2 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LaporanHarianDetailModal laporan={laporanLihat} onClose={() => setLaporanLihat(null)} />
    </div>
  )
}
