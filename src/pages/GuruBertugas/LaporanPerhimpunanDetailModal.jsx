import { X } from 'lucide-react'

function Seksyen({ tajuk, teks }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1.5">{tajuk}</h3>
      <p className="text-sm text-ink whitespace-pre-wrap">{teks || <span className="text-inkmuted">Tiada.</span>}</p>
    </div>
  )
}

export default function LaporanPerhimpunanDetailModal({ laporan, onClose }) {
  if (!laporan) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-ink">Minggu {laporan.minggu}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-5">{laporan.hari}, {laporan.tarikh}</p>

        <Seksyen tajuk="Laporan Sivik" teks={laporan.laporanSivik} />
        <Seksyen tajuk="Hal-Hal Lain" teks={laporan.halLain} />
        <Seksyen tajuk="Ucapan Pentadbir" teks={laporan.ucapanPentadbir} />

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div>
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">Nama Pentadbir</h3>
            <p className="text-sm text-ink">{laporan.namaPentadbir}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">Dilaporkan Oleh</h3>
            <p className="text-sm text-ink">{laporan.dilaporkanOleh}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
