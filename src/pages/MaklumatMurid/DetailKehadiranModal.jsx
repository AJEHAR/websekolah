import { X } from 'lucide-react'

export default function DetailKehadiranModal({ data, onClose }) {
  if (!data || !data.rekod) return null
  const { kelas, rekod } = data

  const hadirSenarai = rekod.senaraiMurid.filter((m) => m.hadir)
  const takHadirSenarai = rekod.senaraiMurid.filter((m) => !m.hadir)

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-ink">{kelas.namaKelas}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-5">{rekod.peratusKehadiran}% kehadiran</p>

        <div className="mb-5">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">
            Hadir ({hadirSenarai.length})
          </h3>
          <div className="space-y-1">
            {hadirSenarai.map((m) => (
              <div key={m.idMurid} className="flex items-center justify-between px-3 py-2 rounded-card bg-base text-sm">
                <span className="text-ink">{m.nama}</span>
                {m.adalahRMT && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-gold text-ink shrink-0">RMT</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">
            Tak Hadir ({takHadirSenarai.length})
          </h3>
          {takHadirSenarai.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada.</p>
          ) : (
            <div className="space-y-1">
              {takHadirSenarai.map((m) => (
                <div key={m.idMurid} className="px-3 py-2 rounded-card bg-base text-sm text-inkmuted">
                  {m.nama}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
