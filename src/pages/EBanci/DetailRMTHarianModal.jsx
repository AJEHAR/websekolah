import { X } from 'lucide-react'
import { formatTarikhPaparan } from '../../lib/dateUtils.js'

export default function DetailRMTHarianModal({ data, onClose }) {
  if (!data) return null

  const ikutKelas = {}
  data.murid.forEach((m) => {
    if (!ikutKelas[m.namaKelas]) ikutKelas[m.namaKelas] = []
    ikutKelas[m.namaKelas].push(m)
  })

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-ink">{formatTarikhPaparan(data.tarikh)}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-5">{data.murid.length} murid RMT hadir</p>

        {Object.entries(ikutKelas).map(([kelas, senarai]) => (
          <div key={kelas} className="mb-4">
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">
              {kelas} ({senarai.length})
            </h3>
            <div className="space-y-1">
              {senarai.map((m) => (
                <div key={m.idMurid} className="px-3 py-2 rounded-card bg-base text-sm text-ink">
                  {m.nama}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
